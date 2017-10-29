"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("rxjs");
const redux_1 = require("redux");
const redux_observable_1 = require("redux-observable");
const awsProvider = require("./lib/aws-provider");
const task_queue_1 = require("./lib/task-queue");
const app_server_1 = require("./lib/app-server");
const scheduler_1 = require("./lib/scheduler");
const instances_1 = require("./lib/instances");
const provisioner_1 = require("./lib/provisioner");
const APP_PORT = parseInt(process.env.PORT || '8000', 10);
const PROVISIONER_POLICY = {
    minVMs: 2,
    maxVMs: 10,
    taskQueueThreshold: 10
};
const rootEpic = redux_observable_1.combineEpics(scheduler_1.default({ maxRetries: 5 }), provisioner_1.default(PROVISIONER_POLICY, {
    startInstance: awsProvider.startInstance,
    terminateInstance: awsProvider.terminateInstance
}));
const epicMiddleware = redux_observable_1.createEpicMiddleware(rootEpic);
const rootReducer = redux_1.combineReducers({
    taskQueue: task_queue_1.default,
    instances: instances_1.default
});
const store = redux_1.createStore(rootReducer, redux_1.applyMiddleware(epicMiddleware));
if (store) {
    const appServer = app_server_1.default({
        getState: () => store.getState(),
        addTask: (args) => store.dispatch(task_queue_1.addTask(args))
    });
    const server = appServer.listen(APP_PORT, () => {
        console.log('App server listening on port: ', APP_PORT);
    });
    store.dispatch({ type: 'BOOTSTRAP' });
    const cleanup = () => {
        store.dispatch({ type: 'TERMINATE_ALL_INSTANCES' });
        server.close(() => {
            setTimeout(() => process.exit(0), 1000);
        });
    };
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
}