// @TODO: Logging
// @TODO: Health check endpoint
import * as path from 'path'
import * as fs from 'fs'
import * as childProcess from 'child_process'

import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as os from 'os'
import * as process from 'process'

const PORT = parseInt(process.env.PORT || '3000', 10)

const app = express()

app.use(cors())
app.use(bodyParser.json())

interface MagickTaskArgsMap {
    [key: string]: string;
}

const MAGICK_ARGS_TEMPLATE: MagickTaskArgsMap = {
    'scale': '|$|%',
    'rotate': '|$|',
    'resize': '|$|x|$|!'
}

const formatArgs = function (task: string, argsVector: [string | number]): string {
    return argsVector
        .map((a) => a.toString())
        .reduce((acc, a) => acc.replace('|$|', a), MAGICK_ARGS_TEMPLATE[task])
}

interface RequestBody {
    source: string,
    tasks: [[string, [string | number]]]
}

// @TODO: Post body validation
// @TODO: Take input from S3
app.post('/process', (req, res) => {
    const {source, tasks} = req.body as RequestBody

    const inputPath = path.resolve(__dirname, source)
    const readStream = fs.createReadStream(inputPath)

    const args = tasks.map(([task, argsVector]) => {
        return [`-${task}`, formatArgs(task, argsVector)]
    }).reduce((a, b) => a.concat(b))


    let program = 'magick'
    console.log('--- Args: ', args)
    if(process.platform === 'linux') { 
        program = 'convert'
    }
    const proc = childProcess.spawn(program, ['-', ...args, '-'])

    res.setHeader('Content-Type', 'image/png')
    proc.stdout.pipe(res)
    readStream.pipe(proc.stdin)
})

// heartbeat
app.get('/heartbeat', (req, res) => {
    res.send({
        memoryFree: os.freemem(),
        memoryPercentage: os.freemem() / os.totalmem(),
        cpu: os.loadavg()[0]
    })
})



app.listen(
    PORT, () => {
    console.log('Listening ' + PORT)
})