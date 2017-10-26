import * as express from 'express'
import * as bodyParser from 'body-parser'

interface AppParams {
    getState: () => object,
    addTask: (args: object) => void
}

export default function createAppServer({getState, addTask}: AppParams) {
    const server = express()

    server.use(bodyParser.json())

    server.post('/add', (req, res) => {
        addTask(req.body)
        res.status(200).end('added task')
    })

    server.get('/state', (req, res) => {
        res.json(getState())
    })

    return server
}
