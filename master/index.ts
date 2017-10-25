import 'rxjs'
import {Store, createStore, applyMiddleware} from 'redux';
import {createEpicMiddleware} from 'redux-observable'

import taskQueue, {TaskQueueState} from './lib/task-queue'
import createAppServer from './lib/app-server'
import createScheduler from './lib/scheduler'

const APP_PORT = parseInt(process.env.PORT || '8000', 10)

const schedulerEpic = createScheduler()
const epicMiddleware = createEpicMiddleware(schedulerEpic)

const store = createStore(taskQueue, applyMiddleware(epicMiddleware))

if (store) {
    const appServer = createAppServer(store as Store<TaskQueueState>)

    appServer.listen(APP_PORT, () => {
        console.log('App server listening on port: ', APP_PORT)
    })
}


