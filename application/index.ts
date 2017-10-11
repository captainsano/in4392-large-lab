import * as express from 'express'

import * as path from 'path'
import * as fs from 'fs'
import * as childProcess from 'child_process'

const PORT = 3000

const app = express()

app.get('/process', (req, res) => {
    const inputPath = path.resolve(__dirname, 'konrad.JPG')
    const readStream = fs.createReadStream(inputPath)

    const proc = childProcess.spawn('magick', [
        '-', 
        '-scale', 
        '25%', 
        '-rotate',
        '90',
        '-'
    ])

    proc.stdout.pipe(res)
    readStream.pipe(proc.stdin)
})

app.listen(PORT, () => {
    console.log('Listening ' + PORT)
})