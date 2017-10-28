import * as R from 'ramda'

import {Instance, MasterState, Task} from './types'

export function pickFreeInstances(state: MasterState): Instance[] {
    const runningInstances = R.compose(
        R.map(([id, instance]) => ({...instance, id})),
        R.toPairs
    )(state.instances.running) as Instance[]

    const runningInstancesNotForTermination = R.reject(
        (i: Instance) => i.scheduledForTermination || false
    )(runningInstances)

    const activeTasks = R.compose(
        R.map(([id, task]) => ({...task, id})),
        R.toPairs
    )(state.taskQueue.active) as Task[]

    return R.reject(
        (i: Instance) => R.any((t: Task) => t.instanceId === i.id)(activeTasks)
    )(runningInstancesNotForTermination)
}

export function pickFreeInstancesScheduledForTermination(state: MasterState): Instance[] {
    const runningInstances = R.compose(
        R.map(([id, instance]) => ({...instance, id})),
        R.toPairs
    )(state.instances.running) as Instance[]

    const runningInstancesForTermination = R.filter(
        (i: Instance) => i.scheduledForTermination || false
    )(runningInstances)

    const activeTasks = R.compose(
        R.map(([id, task]) => ({...task, id})),
        R.toPairs
    )(state.taskQueue.active) as Task[]

    return R.reject(
        (i: Instance) => R.any((t: Task) => t.instanceId === i.id)(activeTasks)
    )(runningInstancesForTermination)
}