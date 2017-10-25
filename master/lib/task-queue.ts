import * as moment from 'moment'
import * as R from 'ramda'
import * as uuid from 'uuid/v4'

interface Task {
    id: string
    args?: {}
    arrivalTime?: moment.Moment,
    executeStartTime?: moment.Moment,
    finishTime?: moment.Moment,
    instanceId?: string
}

interface Action {
    type: 'ADD_TASK' | 'EXECUTE_TASK' | 'FINISH_TASK' | 'FAIL_TASK',
    payload: Task
}

interface State {
    startTime: moment.Moment,
    queue: {
        pending: {[id: string]: Task},
        active: {[id: string]: Task},
        finished: {[id: string]: Task}
    }
}

const INIT_STATE: State = {
    startTime: moment(),
    queue: {
        pending: {},
        active: {},
        finished: {}
    }
}

// Reducer
export default function taskQueue(state = INIT_STATE, {type, payload}: Action): State {
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

export function addTask(args: {}): Action {
    return {
        type: 'ADD_TASK',
        payload: {id: uuid(), args, arrivalTime: moment()}
    }
}

export function executeTask(id: string): Action {
    return {
        type: 'EXECUTE_TASK',
        payload: {
            id,
            executeStartTime: moment()
        }
    }
}
