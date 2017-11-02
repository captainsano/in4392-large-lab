const R = require('ramda')
const moment = require('moment')

const c3_e25 = require('./reports/c3-e2.5.json')
const c3_e5 = require('./reports/c3-e5.json')
const c3_e75 = require('./reports/c3-e7.5.json')

const se0_e25 = require('./reports/se0-e2.5.json')
const se0_e5 = require('./reports/se0-e5.json')
const se0_e75 = require('./reports/se0-e7.5.json')

const se7_e25 = require('./reports/se7-e2.5.json')
const se7_e5 = require('./reports/se7-e5.json')
const se7_e75 = require('./reports/se7-e7.5.json')

const test = require('./reports/test.json')

// Processing time - finish time of last request - arrival time of first request
// TODO: Min-Max
const getProcessingTime = function (report) {
    const lastFinishedTask = R.compose(
        R.nth(0),
        R.sort(R.descend(R.prop('finishTime')))
    )(report.finishedTasks)

    const firstArrivedTask = R.compose(
        R.nth(0),
        R.sort(R.ascend(R.prop('arrivalTime')))
    )(report.finishedTasks)

    return lastFinishedTask.finishTime - firstArrivedTask.arrivalTime
}

// Responsiveness (measure waiting time)
// Execution - arrival time
const getWaitingTime = function (report) {
    return report.finishedTasks
    .map((task) => {
        return task.executeStartTime - task.arrivalTime
    })
    .reduce((a, b) => {
        return a + b
    }, 0)
}

// Instance ter.mination - startTime
// Caution, termination might be null
const getTotalInstanceTime = function (report) {
    return report.terminatedInstances
    .map((instance) => {
        return moment.utc(instance.terminatedTime).valueOf() - moment.utc(instance.startTime).valueOf()
    })
    .reduce((a, b) => {
        return a + b
    }, 0)
}

// Total instance time - processing time
const utilizationTime = function (report) {
    return getProcessingTime(formatReport(report)) / getTotalInstanceTime(formatReport(report))
}

const formatReport = function(report) {
    return {
        finishedTasks: R.map((t) => ({
            id: t.id,
            arrivalTime: moment.utc(t.arrivalTime).valueOf(),
            executeStartTime: moment.utc(t.finishTime).valueOf(),
            finishTime: moment.utc(t.finishTime).valueOf(),
        }))(report.finishedTasks),
        terminatedInstances: report.terminatedInstances
    }
}

console.log('------- PROCESSING TIME --------')
console.log('C3-E2.5 ', getProcessingTime(formatReport(c3_e25)) / 1000, ' seconds')
console.log('C3-E5.0 ', getProcessingTime(formatReport(c3_e5)) / 1000, ' seconds')
console.log('C3-E7.5 ', getProcessingTime(formatReport(c3_e75)) / 1000, ' seconds')
console.log()
console.log('SE0-E2.5 ', getProcessingTime(formatReport(se0_e25)) / 1000, ' seconds')
console.log('SE0-E5.0 ', getProcessingTime(formatReport(se0_e5)) / 1000, ' seconds')
console.log('SE0-E7.5 ', getProcessingTime(formatReport(se0_e75)) / 1000, ' seconds')
console.log()
console.log('SE7-E2.5 ', getProcessingTime(formatReport(se7_e25)) / 1000, ' seconds')
console.log('SE7-E5.0 ', getProcessingTime(formatReport(se7_e5)) / 1000, ' seconds')
console.log('SE7-E7.5 ', getProcessingTime(formatReport(se7_e75)) / 1000, ' seconds')

console.log('------- Responsiveness --------')
console.log('C3-E2.5 ', getWaitingTime(formatReport(c3_e25)) / 1000, ' seconds')
console.log('C3-E5.0 ', getWaitingTime(formatReport(c3_e5)) / 1000, ' seconds')
console.log('C3-E7.5 ', getWaitingTime(formatReport(c3_e75)) / 1000, ' seconds')
console.log()
console.log('SE0-E2.5 ', getWaitingTime(formatReport(se0_e25)) / 1000, ' seconds')
console.log('SE0-E5.0 ', getWaitingTime(formatReport(se0_e5)) / 1000, ' seconds')
console.log('SE0-E7.5 ', getWaitingTime(formatReport(se0_e75)) / 1000, ' seconds')
console.log()
console.log('SE7-E2.5 ', getWaitingTime(formatReport(se7_e25)) / 1000, ' seconds')
console.log('SE7-E5.0 ', getWaitingTime(formatReport(se7_e5)) / 1000, ' seconds')
console.log('SE7-E7.5 ', getWaitingTime(formatReport(se7_e75)) / 1000, ' seconds')

console.log('------- TotalInstanceTime --------')
console.log('C3-E2.5 ', getTotalInstanceTime(formatReport(c3_e25)) / 1000, ' seconds')
console.log('C3-E5.0 ', getTotalInstanceTime(formatReport(c3_e5)) / 1000, ' seconds')
console.log('C3-E7.5 ', getTotalInstanceTime(formatReport(c3_e75)) / 1000, ' seconds')
console.log()
console.log('SE0-E2.5 ', getTotalInstanceTime(formatReport(se0_e25)) / 1000, ' seconds')
console.log('SE0-E5.0 ', getTotalInstanceTime(formatReport(se0_e5)) / 1000, ' seconds')
console.log('SE0-E7.5 ', getTotalInstanceTime(formatReport(se0_e75)) / 1000, ' seconds')
console.log()
console.log('SE7-E2.5 ', getTotalInstanceTime(formatReport(se7_e25)) / 1000, ' seconds')
console.log('SE7-E5.0 ', getTotalInstanceTime(formatReport(se7_e5)) / 1000, ' seconds')
console.log('SE7-E7.5 ', getTotalInstanceTime(formatReport(se7_e75)) / 1000, ' seconds')

console.log('------- Utilization --------')
console.log('C3-E2.5 ', utilizationTime(formatReport(c3_e25)))
console.log('C3-E5.0 ', utilizationTime(formatReport(c3_e5)))
console.log('C3-E7.5 ', utilizationTime(formatReport(c3_e75)))
console.log()
console.log('SE0-E2.5 ', utilizationTime(formatReport(se0_e25)))
console.log('SE0-E5.0 ', utilizationTime(formatReport(se0_e5)))
console.log('SE0-E7.5 ', utilizationTime(formatReport(se0_e75)))
console.log()
console.log('SE7-E2.5 ', utilizationTime(formatReport(se7_e25)))
console.log('SE7-E5.0 ', utilizationTime(formatReport(se7_e5)))
console.log('SE7-E7.5 ', utilizationTime(formatReport(se7_e75)))