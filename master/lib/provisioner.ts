import * as R from 'ramda'
import {Store, Action} from 'redux'
import {ActionsObservable, combineEpics} from 'redux-observable'

import {Observable} from 'rxjs/Observable'
import {MasterState, ProvisionerPolicy} from './types'
import {requestInstances, startInstance} from "./instances";

const PROVISIONER_INTERVAL = 5000
const PROVISIONER_DEBOUNCE = 1000

export default function createProvisioner(policy: ProvisionerPolicy) {
    const queueMonitorEpic = (action$: ActionsObservable<Action>, store: Store<MasterState>) => (
        Observable.merge(action$
                .filter((a: Action) => a.type.endsWith('TASK'))
                .debounceTime(PROVISIONER_DEBOUNCE),
            Observable.interval(PROVISIONER_INTERVAL).startWith(0)
        ).switchMap(() => {
            const state = store.getState() as MasterState
            const pendingQueueLength = R.toPairs(state.taskQueue.pending).length

            if (pendingQueueLength >= policy.taskQueueThreshold) {
                return Observable.of(requestInstances())
            } else {

            }
        })
    )

    return combineEpics(
    )
}
