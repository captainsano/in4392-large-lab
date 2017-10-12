import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as process from 'process'
import {Readable} from 'stream'

import * as childProcess from 'child_process'

const IMAGE_PROGRAM = process.platform.toLowerCase() === 'linux' ? 'convert' : 'magick'
const NS_PER_SEC = 1e9;

interface RequestBody {
    source: string,
    tasks: [[string, [string | number]]]
}

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

interface AppServerParams {
    getImageStream: (source: string) => Readable,
}

export default function createAppServer({getImageStream}: AppServerParams) {
    const app = express()

    app.use(cors())
    app.use(bodyParser.json())

    app.post('/process', (req, res) => {
        const {source, tasks} = req.body as RequestBody

        const args = tasks.map(([task, argsVector]) => {
            return [`-${task}`, formatArgs(task, argsVector)]
        }).reduce((a, b) => a.concat(b))

        const proc = childProcess.spawn(IMAGE_PROGRAM, ['-', ...args, '-'])

        let startTime: [number, number]

        proc.stdout.on('data', () => {})
        proc.on('exit', () => {
            const diff = process.hrtime(startTime)
            res.status(200).end(diff.toString())
        })

        const imageStream = getImageStream(source)
        imageStream.on('end', () => {startTime = process.hrtime()})
        imageStream.pipe(proc.stdin)
    })

    return app
}