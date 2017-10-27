import * as R from 'ramda'

import {Instance, MasterState, Task} from './types'

export function pickFreeInstances(state: MasterState): Instance[] {
    const runningInstances = R.compose(
        R.map(([id, instance]) => ({...instance, id})),
        R.toPairs
    )(state.instances.running) as Instance[]

    const activeTasks = R.compose(
        R.map(([id, task]) => ({...task, id})),
        R.toPairs
    )(state.taskQueue.active) as Task[]

    return R.reject((i: Instance) => R.any((t: Task) => t.instanceId === i.id)(activeTasks))(runningInstances)
}