import 'rxjs'
import {createStore, applyMiddleware} from 'redux'
import {createEpicMiddleware} from 'redux-observable'

import taskQueue, {addTask} from './lib/task-queue'
import createAppServer from './lib/app-server'
import createScheduler from './lib/scheduler'
import {TaskQueueState} from './lib/types'

const APP_PORT = parseInt(process.env.PORT || '8000', 10)

const schedulerEpic = createScheduler()
const epicMiddleware = createEpicMiddleware(schedulerEpic)

const store = createStore(taskQueue, applyMiddleware(epicMiddleware))

if (store) {
    const appServer = createAppServer({
        getState: () => store.getState() as TaskQueueState,
        addTask: (args) => store.dispatch(addTask(args))
    })

    appServer.listen(APP_PORT, () => {
        console.log('App server listening on port: ', APP_PORT)
    })
}

