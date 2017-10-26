import * as moment from 'moment'
import * as R from 'ramda'
import * as uuid from 'uuid/v4'

import {Task, TaskQueueAction, TaskQueueState} from './types'

const INIT_STATE: TaskQueueState = {
    startTime: moment(),
    queue: {
        pending: {},
        active: {}
    }
}

// Reducer
export default function taskQueue(state = INIT_STATE, {type, payload}: TaskQueueAction): TaskQueueState {
    switch (type) {
        case 'ADD_TASK': {
            return R.assocPath(
                ['queue', 'pending', payload.id],
                R.dissoc('id', payload),
                state
            )
        }

        default:
            return state
    }
}

// Helper functions for action handling
export function addTask(args: {}): TaskQueueAction {
    return {
        type: 'ADD_TASK',
        payload: {
            id: uuid(),
            args,
            arrivalTime: moment(),
            retries: -1
        }
    }
}

export function executeTask(task: Task, instanceId: string): TaskQueueAction {
    return {
        type: 'EXECUTE_TASK',
        payload: {
            ...task,
            executeStartTime: moment(),
            retries: task.retries + 1,
            instanceId
        }
    }
}

export function finishTask(task: Task): TaskQueueAction {
    return {
        type: 'FINISH_TASK',
        payload: {
            ...task,
            finishTime: moment()
        }
    }
}
