function mathFun(x) {
  return - Math.pow((x - 2 * Math.sqrt(5)), 2) + 20
}

import * as fs from 'fs'
import * as request from 'request-promise-native'

const urls = fs.readFileSync('urls.txt').toString().split("\n");
const operations = ['scale', 'rotation', 'resize']

const start = 0
const end = 4 * Math.sqrt(5)
const steps = 10
const testDurationInMinutes = 0.25;

const progress = end / steps
const interval = testDurationInMinutes * 1000 * 60 / steps

function* nextStep() {
  for(let i = 0; i <= steps; i++) {
  const requests = mathFun(i * progress)
  yield Math.ceil(requests) +1
  }
}

function randomLandsat() {
  const urlIdx = Math.floor(Math.random() * urls.length)
  const url = urls[urlIdx]
  
  return {
    source: url,
    tasks: [["rotate", [-25]], ["scale", [25]]]
  }
}

var gen = nextStep();


const timer = setInterval(() => {
  const currentGen = gen.next()
  if(currentGen.done) {
    clearInterval(timer)
  }
  const amount = currentGen.value

  Promise.all(Array(amount).fill(0).map(() => {
    return request({
      method: 'POST',
      uri: 'http://example.com/',
      body: randomLandsat(),
      json: true
    })
  }))
  .then((resolved) => {
    console.log(resolved.length + ' request resolved at ' + new Date())
  })
}, interval)

