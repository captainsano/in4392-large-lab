"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const R = require("ramda");
function pickFreeInstances(state) {
    const runningInstances = R.compose(R.map(([id, instance]) => (Object.assign({}, instance, { id }))), R.toPairs)(state.instances.running);
    const runningInstancesNotForTermination = R.reject((i) => i.scheduledForTermination || false)(runningInstances);
    const activeTasks = R.compose(R.map(([id, task]) => (Object.assign({}, task, { id }))), R.toPairs)(state.taskQueue.active);
    return R.reject((i) => R.any((t) => t.instanceId === i.id)(activeTasks))(runningInstancesNotForTermination);
}
exports.pickFreeInstances = pickFreeInstances;
function pickFreeInstancesScheduledForTermination(state) {
    const runningInstances = R.compose(R.map(([id, instance]) => (Object.assign({}, instance, { id }))), R.toPairs)(state.instances.running);
    const runningInstancesForTermination = R.filter((i) => i.scheduledForTermination || false)(runningInstances);
    const activeTasks = R.compose(R.map(([id, task]) => (Object.assign({}, task, { id }))), R.toPairs)(state.taskQueue.active);
    return R.reject((i) => R.any((t) => t.instanceId === i.id)(activeTasks))(runningInstancesForTermination);
}
exports.pickFreeInstancesScheduledForTermination = pickFreeInstancesScheduledForTermination;
