import 'rxjs'
import {createStore, combineReducers, applyMiddleware, Action} from 'redux'
import {createEpicMiddleware, combineEpics, ActionsObservable} from 'redux-observable'

import {Instance, MasterState, TaskQueueState} from './lib/types'
import * as localMockProvider from './lib/local-mock-provider'

import taskQueue, {addTask} from './lib/task-queue'
import createAppServer from './lib/app-server'
import createScheduler from './lib/scheduler'
import instances, {runInstance, startInstance} from './lib/instances'
import createProvisioner from './lib/provisioner'

const APP_PORT = parseInt(process.env.PORT || '8000', 10)
const PROVISIONER_POLICY = {
    minVMs: 2,
    maxVMs: 10,
    taskQueueThreshold: 10
}

// const loggerEpic = function (action$: ActionsObservable<Action>) {
//     return action$
//         .filter((a: Action) => a.type !== 'NULL')
//         .do((a: Action) => console.log('----> ', a.type, '%%%% \n', a, '\n-----'))
//         .mapTo({type: 'NULL'})
// }

const rootEpic = combineEpics(
    createScheduler({maxRetries: 5}),
    createProvisioner(PROVISIONER_POLICY, {
        startInstance: localMockProvider.startInstance,
        terminateInstance: localMockProvider.terminateInstance
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

    appServer.listen(APP_PORT, () => {
        console.log('App server listening on port: ', APP_PORT)
    })

    store.dispatch({type: 'BOOTSTRAP'})
}
