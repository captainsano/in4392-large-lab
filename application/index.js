"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var PORT = 3000;
var app = express();
app.get('/', function (req, res) {
    res.status(200).end('Hello');
});
app.listen(PORT, function () {
    console.log('Listening ' + PORT);
});
