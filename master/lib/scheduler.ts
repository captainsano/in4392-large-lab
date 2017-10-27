import {Store, Action} from 'redux'
import {ActionsObservable, combineEpics} from 'redux-observable'
import {Observable} from 'rxjs/Observable'

import {MasterState, Task, TaskQueueAction} from './types'
import {pickFreeInstances} from './utils'
import {executeTask, pickPendingTasks, failTask, finishTask} from './task-queue'

const SCHEDULER_INTERVAL = 5000
const SCHEDULER_DEBOUNCE = 1000

export default function createScheduler() {
    const schedulerPoll = Observable.merge(Observable.interval(SCHEDULER_INTERVAL), Observable.of(0))
    const schedulerKickStart = Observable.of(0).delay(SCHEDULER_INTERVAL * 0.5)

    const allocatorEpic = (action$: ActionsObservable<Action>, store: Store<MasterState>) => (
        Observable.merge(action$.ofType('ADD_TASK'), schedulerKickStart)
            .switchMap(() => schedulerPoll)
            .debounceTime(SCHEDULER_DEBOUNCE)
            .do(() => console.log('---> SCHEDULER is running'))
            .switchMap(() => {
                const state = store.getState()
                const freeInstances = pickFreeInstances(state)

                if (freeInstances.length > 0) {
                    const pendingTasks = pickPendingTasks(state.taskQueue, freeInstances.length)

                    return Observable
                        .zip(Observable.from(freeInstances), Observable.from(pendingTasks))
                        .map(([fi, pt]) => executeTask(pt, fi.id))
                }

                return Observable.from([])
            })

    )

    const executorEpic = (action$: ActionsObservable<Action>, store: Store<MasterState>) => (
        action$
            .ofType('EXECUTE_TASK')
            .switchMap((action: TaskQueueAction) => {
                console.log('---> Executing task \n', action.payload)
                const state = store.getState() as MasterState
                const task = action.payload as Task

                if (task.instanceId) {
                    const instance = state.instances.running[task.instanceId]

                    return Observable
                        .ajax({
                            url: `http://${instance.ipAddress}/process`,
                            method: 'POST',
                            body: task.args
                        })
                        .mapTo(finishTask(task))
                        .catch(() => Observable.of(failTask(task)))
                }

                return Observable.of(failTask(task))
            })
    )

    return combineEpics(
        allocatorEpic,
        executorEpic
    )
}