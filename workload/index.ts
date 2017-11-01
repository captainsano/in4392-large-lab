import * as path from 'path'
import * as fs from 'fs'
import {Observable} from 'rxjs'
import axios from 'axios'
import * as moment from 'moment'

const BASE_DELAY = parseInt(process.env.BASE_DELAY || '100', 10)
const TOTAL_REQUESTS = parseInt(process.env.TOTAL_REQUESTS || '1000', 10)
const TOTAL_HALF_REQUESTS = TOTAL_REQUESTS / 2
const START_TIMESTAMP = moment().valueOf()

const urls = fs.readFileSync(path.join(__dirname, '45-55-urls.txt')).toString()

Observable
    .from(urls.split('\n'))
    .take(TOTAL_REQUESTS)
    .concatMap((url, i) => (
        Observable
            .of(url)
            .delayWhen(() => Observable.timer(
              i <= TOTAL_HALF_REQUESTS ? i * BASE_DELAY : (TOTAL_REQUESTS - i) * BASE_DELAY
            ))
            .do(() => {
                axios.post('http://localhost:8000/add', {
                    source: url,
                    tasks: [['scale', [25]], ['rotate', [90]]]
                }).then(() => {}).catch(() => console.log('Error making request at tick: ', i))
            })
            .mapTo(i)
    ))
    .subscribe((i) => {
        console.log(`${i}\t${moment().valueOf() - START_TIMESTAMP}`)
    })
