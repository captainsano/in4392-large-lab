import * as R from 'ramda'
import {Store, Action} from 'redux'
import {ActionsObservable, combineEpics} from 'redux-observable'
import {Observable} from 'rxjs/Observable'
import axios from 'axios'

import {ProvisionerPolicy, Instance, MasterState, InstanceAction} from './types'
import {
    requestInstance, runInstance, scheduleForTerminationInstance, startInstance, terminateInstance,
    unscheduleForTerminationInstance
} from "./instances";
import {pickFreeInstances, pickFreeInstancesScheduledForTermination} from "./utils";

const PROVISIONER_INTERVAL = 5000
const PROVISIONER_DEBOUNCE = 1000
const HEALTH_CHECK_INTERVAL = 1000
const INSTANCE_READY_TIMEOUT = 60 * 1000
const TERMINATION_WAIT_TIME = 10 * 1000

interface CloudProvider {
    startInstance: () => Promise<Instance>,
    terminateInstance: (i: Instance) => Promise<void>
}

const healthCheck = (i: Instance) => (
    Observable
        .interval(HEALTH_CHECK_INTERVAL)
        .flatMap(() => (
            Observable.fromPromise(axios.get(`http://${i.ipAddress}:3001/health`))
                .map((r) => r.data)
                .catch((e) => Observable.of('NOT_YET_READY'))
        ))
        .filter((d) => d !== 'NOT_YET_READY')
        .take(1)
        .timeout(INSTANCE_READY_TIMEOUT)
        .mapTo(i)
)

export default function createProvisioner<S extends MasterState>(policy: ProvisionerPolicy, cloudProvider: CloudProvider) {
    const provisionerPoll = Observable.interval(PROVISIONER_INTERVAL).startWith(0)
    const provisionerKickStart = Observable.of(0).delay(PROVISIONER_INTERVAL * 0.5)

    console.log('Am here')

    const queueThresholdProvisioningPolicyEpic = (action$: ActionsObservable<Action>, store: Store<S>) => (
        Observable.merge(action$.filter((a: Action) => a.type.endsWith('TASK')), provisionerKickStart)
            .switchMap(() => provisionerPoll)
            .debounceTime(PROVISIONER_DEBOUNCE)
            .do(() => '------> PROVISIONER is running')
            .concatMap(() => {
                const state = store.getState() as S
                const pendingQueueLength = R.toPairs(state.taskQueue.pending).length

                // TODO: Adjust for policy and maintain min-vms, max-vms

                if (pendingQueueLength > policy.taskQueueThreshold) {
                    return Observable.of(requestInstance())
                } else if (pendingQueueLength < policy.taskQueueThreshold) {
                    const freeInstances = pickFreeInstances(state)
                    return Observable.of(...freeInstances).map(scheduleForTerminationInstance)
                }

                return Observable.of({type: 'NULL'})
            })
    )

    const requestInstanceEpic = (action$: ActionsObservable<Action>, store: Store<S>) => (
        action$
            .ofType('REQUEST_INSTANCE')
            .flatMap(() => {
                const state = store.getState() as S
                // Try to recover an existing instance scheduled for termination
                const instancesToTerminate = pickFreeInstancesScheduledForTermination(state)

                if (instancesToTerminate.length > 0) {
                    return Observable.of(...instancesToTerminate).take(1).map(unscheduleForTerminationInstance)
                }

                return Observable
                    .fromPromise(cloudProvider.startInstance())
                    .map(startInstance)
            })
    )

    const instanceStartEpic = (action$: ActionsObservable<InstanceAction>, store: Store<S>) => (
        action$
            .ofType('START_INSTANCE')
            .map((action: InstanceAction) => action.payload)
            .flatMap((instance) => (
                healthCheck(instance)
                    .map(runInstance)
                    .catch(() => Observable.of(terminateInstance(instance)))
            ))
    )

    const instanceTerminateSchedulerEpic = (action$: ActionsObservable<InstanceAction>, store: Store<S>) => (
        action$
            .ofType('SCHEDULE_FOR_TERMINATION_INSTANCE')
            .map((action: InstanceAction) => action.payload)
            .flatMap((instance: Instance) => (
                Observable
                    .of(instance)
                    .delay(TERMINATION_WAIT_TIME)
                    .takeUntil(
                        action$
                            .ofType('UNSCHEDULE_FOR_TERMINATION_INSTANCE')
                            .map((a: InstanceAction) => a.payload)
                            .filter((i: Instance) => instance.id === i.id)
                    )
                    .map(terminateInstance)
            ))
    )

    const instanceTerminateEpic = (action$: ActionsObservable<InstanceAction>, store: Store<S>) => (
        action$
            .ofType('TERMINATE_INSTANCE')
            .map((action: InstanceAction) => action.payload)
            .flatMap((instance: Instance) => Observable.fromPromise(cloudProvider.terminateInstance(instance)))
            .mapTo({type: 'NULL'})
    )

    return combineEpics(
        queueThresholdProvisioningPolicyEpic,
        requestInstanceEpic,
        instanceStartEpic,
        instanceTerminateSchedulerEpic,
        instanceTerminateEpic
    )
}
