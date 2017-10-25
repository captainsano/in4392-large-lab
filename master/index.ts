import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as redux from 'redux'

import taskQueue, {addTask} from './lib/task-queue'

const PORT = parseInt(process.env.PORT || '8000', 10)

const store = redux.createStore(taskQueue)

const createAppServer = function() {
    const server = express()

    server.use(bodyParser.json())

    server.post('/add', (req, res) => {
        store.dispatch(addTask(req.body))
        res.status(200).end('added task')
    })

    server.get('/state', (req, res) => {
        res.status(200).end(JSON.stringify(store.getState()))
    })

    return server
}

const appServer = createAppServer()

appServer.listen(PORT, () => {
    console.log('App server listening on port: ', PORT)
})