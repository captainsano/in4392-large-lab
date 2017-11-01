"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const rxjs_1 = require("rxjs");
const axios_1 = require("axios");
const moment = require("moment");
const BASE_DELAY = parseInt(process.env.BASE_DELAY || '100', 10);
const TOTAL_REQUESTS = parseInt(process.env.TOTAL_REQUESTS || '1000', 10);
const TOTAL_HALF_REQUESTS = TOTAL_REQUESTS / 2;
const START_TIMESTAMP = moment().valueOf();
const urls = fs.readFileSync(path.join(__dirname, '45-55-urls.txt')).toString();
rxjs_1.Observable
    .from(urls.split('\n'))
    .take(TOTAL_REQUESTS)
    .concatMap((url, i) => (rxjs_1.Observable
    .of(url)
    .delayWhen(() => rxjs_1.Observable.timer(i <= TOTAL_HALF_REQUESTS ? i * BASE_DELAY : (TOTAL_REQUESTS - i) * BASE_DELAY))
    .do(() => {
    axios_1.default.post('http://localhost:8000/add', {
        source: url,
        tasks: [['scale', [25]], ['rotate', [90]]]
    }).then(() => { }).catch(() => console.log('Error making request at tick: ', i));
})
    .mapTo(i)))
    .subscribe((i) => {
    console.log(`${i}\t${moment().valueOf() - START_TIMESTAMP}`);
});
