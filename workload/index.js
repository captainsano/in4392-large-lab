"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const axios_1 = require("axios");
const moment = require("moment");
const constant_1 = require("./constant");
const exponential_1 = require("./exponential");
const spike_1 = require("./spike");
const FUNCTION = (process.env.FUNCTION || '').toLowerCase();
const HOST = process.env.HOST || 'localhost';
if (['constant', 'exponential', 'spike'].indexOf(FUNCTION) < 0) {
    console.log('Function not supported or unspecified');
    process.exit(1);
}
const BASE_DELAY = parseInt(process.env.BASE_DELAY || '100', 10);
const TOTAL_REQUESTS = parseInt(process.env.TOTAL_REQUESTS || '1000', 10);
const urls = fs.readFileSync(path.join(__dirname, '45-55-urls.txt')).toString().split('\n');
const START_TIMESTAMP = moment().valueOf();
let chosenFunction = null;
if (FUNCTION === 'constant')
    chosenFunction = constant_1.default;
if (FUNCTION === 'exponential')
    chosenFunction = exponential_1.default;
if (FUNCTION === 'spike')
    chosenFunction = spike_1.default;
if (chosenFunction) {
    chosenFunction(urls, BASE_DELAY, TOTAL_REQUESTS, (url, tick) => {
        axios_1.default.post(`http://${HOST}:8000/add`, {
            source: url,
            tasks: [['scale', [25]], ['rotate', [90]]]
        }).then(() => { }).catch(() => console.log('Error making request at tick: ', tick + 1));
    })
        .subscribe((i) => {
        console.log(`${i + 1}\t${moment().valueOf() - START_TIMESTAMP}`);
    });
}
