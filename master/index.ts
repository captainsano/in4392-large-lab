import * as AWS from 'aws-sdk'
import * as express from 'express'
import * as R from 'ramda'
import * as redux from 'redux'

import counter from './lib/counter'

const PORT = parseInt(process.env.PORT || '8000', 10)

const store = redux.createStore(counter)

const createCounterServer = function() {
    const counterServer = express()

    counterServer.get('/increment', (req, res) => {
        store.dispatch({type: 'INCREMENT'})
        res.status(200).end('incremented')
    })

    counterServer.get('/decrement', (req, res) => {
        store.dispatch({type: 'DECREMENT'})
        res.status(200).end('decremented')
    })

    counterServer.get('/state', (req, res) => {
        res.status(200).end(JSON.stringify(store.getState()))
    })

    return counterServer
}

const counterServer = createCounterServer()

counterServer.listen(PORT, () => {
    console.log('Counter server listening on port: ', PORT)
})