import * as moment from 'moment'
import * as R from 'ramda'
import * as uuid from 'uuid/v4'
import {Action} from 'redux';

export interface Task {
    id: string
    args?: {}
    arrivalTime?: moment.Moment,
    executeStartTime?: moment.Moment,
    finishTime?: moment.Moment,
    retries?: number,
    instanceId?: string
}

export interface TaskQueueAction extends Action {
    type: 'ADD_TASK' | 'EXECUTE_TASK' | 'FINISH_TASK' | 'FAIL_TASK',
    payload: Task
}

export interface TaskQueueState {
    startTime: moment.Moment,
    queue: {
        pending: {[id: string]: Task},
        active: {[id: string]: Task},
        finished: {[id: string]: Task}
    }
}

const INIT_STATE: TaskQueueState = {
    startTime: moment(),
    queue: {
        pending: {},
        active: {},
        finished: {}
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

// Helper functions for task creation

export function addTask(args: {}): TaskQueueAction {
    return {
        type: 'ADD_TASK',
        payload: {id: uuid(), args, arrivalTime: moment()}
    }
}

export function executeTask(id: string): TaskQueueAction {
    return {
        type: 'EXECUTE_TASK',
        payload: {
            id,
            executeStartTime: moment()
        }
    }
}
