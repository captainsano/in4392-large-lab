"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @TODO: Logging
// @TODO: Health check endpoint
var path = require("path");
var fs = require("fs");
var childProcess = require("child_process");
var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var os = require("os");
var process = require("process");
var PORT = parseInt(process.env.PORT || '3000', 10);
var IMAGE_PROGRAM = process.platform.toLowerCase() === 'linux' ? 'convert' : 'magick';
var app = express();
app.use(cors());
app.use(bodyParser.json());
var MAGICK_ARGS_TEMPLATE = {
    'scale': '|$|%',
    'rotate': '|$|',
    'resize': '|$|x|$|!'
};
var formatArgs = function (task, argsVector) {
    return argsVector
        .map(function (a) { return a.toString(); })
        .reduce(function (acc, a) { return acc.replace('|$|', a); }, MAGICK_ARGS_TEMPLATE[task]);
};
// @TODO: Post body validation
// @TODO: Take input from S3
app.post('/process', function (req, res) {
    var _a = req.body, source = _a.source, tasks = _a.tasks;
    var inputPath = path.resolve(__dirname, source);
    var readStream = fs.createReadStream(inputPath);
    var args = tasks.map(function (_a) {
        var task = _a[0], argsVector = _a[1];
        return ["-" + task, formatArgs(task, argsVector)];
    }).reduce(function (a, b) { return a.concat(b); });
    var proc = childProcess.spawn(IMAGE_PROGRAM, ['-'].concat(args, ['-']));
    res.setHeader('Content-Type', 'image/png');
    proc.stdout.pipe(res);
    readStream.pipe(proc.stdin);
});
// heartbeat
app.get('/heartbeat', function (req, res) {
    res.send({
        memoryFree: os.freemem(),
        memoryPercentage: os.freemem() / os.totalmem(),
        cpu: os.loadavg()[0]
    });
});
app.listen(PORT, function () {
    console.log('Listening ' + PORT);
});
