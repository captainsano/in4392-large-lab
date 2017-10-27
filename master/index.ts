import 'rxjs'
import {createStore, combineReducers, applyMiddleware, Action} from 'redux'
import {createEpicMiddleware, combineEpics, ActionsObservable} from 'redux-observable'
import * as moment from 'moment'

import {MasterState, TaskQueueState} from './lib/types'

import taskQueue, {addTask} from './lib/task-queue'
import createAppServer from './lib/app-server'
import createScheduler from './lib/scheduler'
import instances, {runInstance, startInstance} from './lib/instances'

const APP_PORT = parseInt(process.env.PORT || '8000', 10)

const loggerEpic = function (action$: ActionsObservable<Action>) {
    return action$
        .filter((a: Action) => a.type !== 'NULL')
        .do((a: Action) => console.log('----> ', a.type, '%%%% \n', a, '\n-----'))
        .mapTo({type: 'NULL'})
}

const rootEpic = combineEpics(createScheduler(), loggerEpic)
const epicMiddleware = createEpicMiddleware(rootEpic)

const rootReducer = combineReducers({
    taskQueue,
    instances
})

const store = createStore(rootReducer, applyMiddleware(epicMiddleware))

if (store) {
    const appServer = createAppServer({
        getState: () => store.getState() as MasterState,
        addTask: (args) => store.dispatch(addTask(args))
    })

    appServer.listen(APP_PORT, () => {
        console.log('App server listening on port: ', APP_PORT)
    })
}

