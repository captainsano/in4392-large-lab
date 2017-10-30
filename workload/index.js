"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const request = require("request-promise-native");
const inputFile = '45-55-urls.txt';
const masterUrl = "http://localhost:8000/add";
const distribution = "eFun"; // normal, linear, eFun
const MaxRequest = 20;
const steps = 10;
const testDurationInMinutes = 0.25;
// see https://www.wolframalpha.com/input/?i=2.5+*+(e%5E(-(2%2F5+*+x)%5E2%2F(2))%2Fsqrt(2+%CF%80)+)
// not always exaclty MaxRequest the function has no intersection with 0
function normalDistribution(x) {
    const exponent = -0.5 * Math.pow(2 / 5 * x, 2);
    return Math.floor(2.5 * (Math.pow(Math.E, exponent) / Math.sqrt(2 * Math.PI)) * MaxRequest);
}
// will reach the MaxRequest after the testDurationInMinutes
function linear(x) {
    return Math.floor(MaxRequest / testDurationInMinutes * x);
}
function eFun(x) {
    return Math.floor(Math.pow(Math.E, x));
}
let distrubutionFunction;
let start = 0;
let end = 0;
switch (distribution) {
    case "normal":
        distrubutionFunction = normalDistribution;
        start = -8.4;
        end = 8.4;
        break;
    case "linear":
        distrubutionFunction = linear;
        start = 0;
        end = testDurationInMinutes;
        break;
    case 'eFun':
        distrubutionFunction = eFun;
        start = -3;
        end = Math.log(MaxRequest);
}
const progress = (end - start) / steps;
const interval = testDurationInMinutes * 1000 * 60 / steps;
const urls = fs.readFileSync(inputFile).toString().split("\n");
function* nextStep() {
    for (let i = 0; i <= steps; i++) {
        yield distrubutionFunction(start + i * progress);
    }
}
function randomLandsat() {
    const urlIdx = Math.floor(Math.random() * urls.length);
    const url = urls[urlIdx];
    const tasks = randomTasks();
    return {
        source: url,
        tasks
    };
}
function randomTasks() {
    return Array(Math.floor(Math.random() * 4 + 1)).fill(0).map(() => {
        return randomTask();
    });
}
function randomTask() {
    const tasks = [];
    const operations = ['scale', 'rotation', 'resize'];
    const operation = Math.floor(Math.random() * operations.length);
    switch (operation) {
        case 0:
            return [
                "scale",
                [
                    Math.floor(Math.random() * 99 + 1)
                ]
            ];
        case 1:
            return [
                "rotate",
                [
                    Math.floor(Math.random() * 359 + 1)
                ]
            ];
        case 2:
            return [
                "resize",
                [
                    Math.floor(Math.random() * 100 + 1),
                    Math.floor(Math.random() * 100 + 1)
                ]
            ];
        default:
            break;
    }
}
var gen = nextStep();
const timer = setInterval(() => {
    const currentGen = gen.next();
    if (currentGen.done) {
        clearInterval(timer);
        return;
    }
    const amount = currentGen.value;
    Promise.all(Array(amount).fill(0).map(() => {
        return request({
            method: 'POST',
            uri: masterUrl,
            body: randomLandsat(),
            json: true
        });
    }))
        .then((resolved) => {
        console.log(resolved.length + ' request resolved at ' + new Date());
    });
}, interval);
