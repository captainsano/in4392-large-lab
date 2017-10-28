import 'rxjs'
import {createStore, combineReducers, applyMiddleware} from 'redux'
import {createEpicMiddleware, combineEpics} from 'redux-observable'

import {MasterState} from './lib/types'
import * as awsProvider from './lib/aws-provider'

import taskQueue, {addTask} from './lib/task-queue'
import createAppServer from './lib/app-server'
import createScheduler from './lib/scheduler'
import instances from './lib/instances'
import createProvisioner from './lib/provisioner'

const APP_PORT = parseInt(process.env.PORT || '8000', 10)
const PROVISIONER_POLICY = {
    minVMs: 2,
    maxVMs: 10,
    taskQueueThreshold: 10
}

const rootEpic = combineEpics(
    createScheduler({maxRetries: 5}),
    createProvisioner(PROVISIONER_POLICY, {
        startInstance: awsProvider.startInstance,
        terminateInstance: awsProvider.terminateInstance
    })
)

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

    const server = appServer.listen(APP_PORT, () => {
        console.log('App server listening on port: ', APP_PORT)
    })

    store.dispatch({type: 'BOOTSTRAP'})

    process.on('SIGTERM', () => {
        server.close(() => {
            store.dispatch({type: 'TERMINATE_ALL_INSTANCES'})
            setTimeout(() => process.exit(0), 1000)
        })
    })
}