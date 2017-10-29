import 'rxjs'
import {createStore, combineReducers, applyMiddleware, Store} from 'redux'
import {createEpicMiddleware, combineEpics} from 'redux-observable'

import {MasterState, ReportState} from './lib/types'
import * as awsProvider from './lib/aws-provider'
import * as localProvider from './lib/local-mock-provider'

import taskQueue, {addTask} from './lib/task-queue'
import createAppServer from './lib/app-server'
import createScheduler from './lib/scheduler'
import instances from './lib/instances'
import createProvisioner from './lib/provisioner'
import reportReducer from './lib/report-reducer'
import createReporter from './lib/reporter'

const APP_PORT = parseInt(process.env.PORT || '8000', 10)
const POLICY = {
    maxRetries: parseInt(process.env.POLICY_MAXRETRIES || '5', 10),
    minVMs: parseInt(process.env.POLICY_MINVMS || '0', 10),
    maxVMs: parseInt(process.env.POLICY_MAXVMS || '10', 10),
    taskQueueThreshold: parseInt(process.env.POLICY_THRESHOLD || '5', 10)
}

const PROVISIONER_POLICY = {
    minVMs: POLICY.minVMs,
    maxVMs: POLICY.maxVMs,
    taskQueueThreshold: POLICY.taskQueueThreshold
}

const SCHEDULER_POLICY = {
    maxRetries: POLICY.maxRetries
}

const reportStore = createStore(reportReducer)

const provider = (process.env.PROVIDER || '').toLowerCase() === 'local' ? {
    startInstance: localProvider.startInstance,
    terminateInstance: localProvider.terminateInstance
} : {
    startInstance: awsProvider.startInstance,
    terminateInstance: awsProvider.terminateInstance
}

const rootEpic = combineEpics(
    createScheduler(SCHEDULER_POLICY),
    createProvisioner(PROVISIONER_POLICY, provider),
    createReporter(reportStore as Store<ReportState>)
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
        getReport: () => reportStore.getState() as ReportState,
        addTask: (args) => store.dispatch(addTask(args))
    })

    const server = appServer.listen(APP_PORT, () => {
        console.log('App server listening on port: ', APP_PORT)
    })

    store.dispatch({type: 'BOOTSTRAP'})

    const cleanup = () => {
        store.dispatch({type: 'TERMINATE_ALL_INSTANCES'})
        server.close(() => {
            setTimeout(() => process.exit(0), 1000)
        })
    }

    process.on('SIGTERM', cleanup)
    process.on('SIGINT', cleanup)
}