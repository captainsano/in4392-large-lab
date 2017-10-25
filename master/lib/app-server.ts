import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as redux from 'redux'

import {addTask, TaskQueueState} from './task-queue'

export default function createAppServer(store: redux.Store<TaskQueueState>) {
    const server = express()

    server.use(bodyParser.json())

    server.post('/add', (req, res) => {
        store.dispatch(addTask(req.body))
        res.status(200).end('added task')
    })

    server.get('/state', (req, res) => {
        res.json(store.getState())
    })

    return server
}
