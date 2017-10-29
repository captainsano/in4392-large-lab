"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
function createAppServer({ getState, addTask }) {
    const server = express();
    server.use(bodyParser.json());
    server.post('/add', (req, res) => {
        addTask(req.body);
        res.status(200).end('added task');
    });
    server.get('/state', (req, res) => {
        res.json(getState());
    });
    return server;
}
exports.default = createAppServer;
