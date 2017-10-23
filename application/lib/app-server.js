"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const process = require("process");
const childProcess = require("child_process");
const IMAGE_PROGRAM = process.platform.toLowerCase() === 'linux' ? 'convert' : 'magick';
const NS_PER_SEC = 1e9;
const MAGICK_ARGS_TEMPLATE = {
    'scale': '|$|%',
    'rotate': '|$|',
    'resize': '|$|x|$|!'
};
const formatArgs = function (task, argsVector) {
    return argsVector
        .map((a) => a.toString())
        .reduce((acc, a) => acc.replace('|$|', a), MAGICK_ARGS_TEMPLATE[task]);
};
function createAppServer({ getImageStream }) {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.post('/process', (req, res) => {
        const { source, tasks } = req.body;
        const args = tasks.map(([task, argsVector]) => {
            return [`-${task}`, formatArgs(task, argsVector)];
        }).reduce((a, b) => a.concat(b));
        const proc = childProcess.spawn(IMAGE_PROGRAM, ['-', ...args, '-']);
        let startTime;
        proc.stdout.on('data', () => { });
        proc.on('exit', () => {
            const diff = process.hrtime(startTime);
            res.status(200).end(diff.toString());
        });
        const imageStream = getImageStream(source);
        imageStream.on('end', () => { startTime = process.hrtime(); });
        imageStream.pipe(proc.stdin);
    });
    return app;
}
exports.default = createAppServer;
