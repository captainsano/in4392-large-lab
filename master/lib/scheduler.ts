import {Store} from 'redux'
import {ActionsObservable} from 'redux-observable'
import {Observable} from 'rxjs/Observable'

import {TaskQueueAction, TaskQueueState} from './types'

const SCHEDULER_INTERVAL = 5000
const SCHEDULER_DEBOUNCE = 1000

export default function createScheduler() {
    const schedulerPoll = Observable.merge(Observable.interval(SCHEDULER_INTERVAL), Observable.of(0))
    const schedulerKickStart = Observable.of(0).delay(SCHEDULER_INTERVAL * 0.5)

    return (action$: ActionsObservable<TaskQueueAction>, store: Store<TaskQueueState>) => (
        Observable.merge(action$.ofType('ADD_TASK'), schedulerKickStart)
            .switchMap(() => schedulerPoll)
            .debounceTime(SCHEDULER_DEBOUNCE)
            .do(() => console.log('SCHEDULING NOW')) // TODO: Inspect the pending queue and schedule the tasks
            .mapTo({type: 'NULL'})
    )
}