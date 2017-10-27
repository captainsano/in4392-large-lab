import 'rxjs'
import {createStore, combineReducers, applyMiddleware} from 'redux'
import {createEpicMiddleware, combineEpics} from 'redux-observable'

import {TaskQueueState} from './lib/types'

import taskQueue, {addTask} from './lib/task-queue'
import createAppServer from './lib/app-server'
import createScheduler from './lib/scheduler'

const APP_PORT = parseInt(process.env.PORT || '8000', 10)

const rootEpic = combineEpics(createScheduler())
const epicMiddleware = createEpicMiddleware(rootEpic)

const rootReducer = combineReducers({
    taskQueue,
})

const store = createStore(rootReducer, applyMiddleware(epicMiddleware))

if (store) {
    const appServer = createAppServer({
        getState: () => store.getState() as TaskQueueState,
        addTask: (args) => store.dispatch(addTask(args))
    })

    appServer.listen(APP_PORT, () => {
        console.log('App server listening on port: ', APP_PORT)
    })
}

