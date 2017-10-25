import * as redux from 'redux'

import taskQueue, {State} from './lib/task-queue'
import createAppServer from './lib/app-server'

const APP_PORT = parseInt(process.env.PORT || '8000', 10)

const store = redux.createStore(taskQueue)

if (store) {
    const appServer = createAppServer(store as redux.Store<State>)

    appServer.listen(APP_PORT, () => {
        console.log('App server listening on port: ', APP_PORT)
    })
}


