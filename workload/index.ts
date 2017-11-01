import * as path from 'path'
import * as fs from 'fs'
import {Observable} from 'rxjs'
import axios from 'axios'
import * as moment from 'moment'
import {Functions, TimingFunction} from './types'

import constant from './constant'
import exponential from './exponential'
import spike from './spike'

const FUNCTION = (process.env.FUNCTION || '').toLowerCase()

if (['constant', 'exponential', 'spike'].indexOf(FUNCTION) < 0) {
    console.log('Function not supported or unspecified')
    process.exit(1)
}

const BASE_DELAY = parseInt(process.env.BASE_DELAY || '100', 10)
const TOTAL_REQUESTS = parseInt(process.env.TOTAL_REQUESTS || '1000', 10)

const urls = fs.readFileSync(path.join(__dirname, '45-55-urls.txt')).toString().split('\n')

const START_TIMESTAMP = moment().valueOf()

let chosenFunction = null

if (FUNCTION === 'constant') chosenFunction = constant
if (FUNCTION === 'exponential') chosenFunction = exponential
if (FUNCTION === 'spike') chosenFunction = spike

if (chosenFunction) {
    chosenFunction(urls, BASE_DELAY, TOTAL_REQUESTS, (url: string, tick: number) => {
        axios.post('http://localhost:8000/add', {
            source: url,
            tasks: [['scale', [25]], ['rotate', [90]]]
        }).then(() => {}).catch(() => console.log('Error making request at tick: ', tick + 1))
    }) 
    .subscribe((i) => {
        console.log(`${i + 1}\t${moment().valueOf() - START_TIMESTAMP}`)
    })
}