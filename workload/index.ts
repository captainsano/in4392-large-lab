import * as fs from 'fs'
import * as request from 'request-promise-native'

const urls = fs.readFileSync('urls.txt').toString().split("\n");

function mathFun(x: number) {
  return - Math.pow((x - 2 * Math.sqrt(5)), 2) + 20
}

const masterUrl = "http://localhost:8000/add"

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
  const tasks = randomTasks();
  
  return {
    source: url,
    tasks
  }
}

function randomTasks() {
  return Array(Math.floor(Math.random() * 4 + 1)).fill(0).map(() => {
    return randomTask()
  })
}

function randomTask() {
  const tasks = []
  const operations = ['scale', 'rotation', 'resize']  
  const operation = Math.floor(Math.random() * operations.length)
  
  switch (operation) {
    case 0:
      return ["scale", [Math.floor(Math.random() * 99 + 1)]]
    case 1: 
      return [["rotation"], [Math.floor(Math.random() * 359 + 1)]]
    case 2: 
      return [
        ["resize"],
          [
            Math.floor(Math.random() * 100 + 1),
            Math.floor(Math.random() * 100 + 1)
          ]
      ]
    default:
      break;
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
      uri: masterUrl,
      body: randomLandsat(),
      json: true
    })
  }))
  .then((resolved) => {
    console.log(resolved.length + ' request resolved at ' + new Date())
  })
}, interval)

