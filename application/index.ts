import * as express from 'express'

const PORT = 3000

const app = express()

app.get('/', (req, res) => {
    res.status(200).end('Hello')
})

app.listen(PORT, () => {
    console.log('Listening ' + PORT)
})