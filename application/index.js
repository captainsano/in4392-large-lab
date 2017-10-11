"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var fs = require("fs");
var childProcess = require("child_process");
var PORT = 3000;
var app = express();
app.get('/process', function (req, res) {
    var inputPath = path.resolve(__dirname, 'konrad.JPG');
    var readStream = fs.createReadStream(inputPath);
    var proc = childProcess.spawn('magick', [
        '-',
        '-scale',
        '25%',
        '-rotate',
        '90',
        '-'
    ]);
    proc.stdout.pipe(res);
    readStream.pipe(proc.stdin);
});
app.listen(PORT, function () {
    console.log('Listening ' + PORT);
});
