import {Moment} from 'moment'
import {Action} from 'redux'

export interface Task {
    id: string
    args: {}
    arrivalTime: Moment,
    retries: number,
    executeStartTime?: Moment,
    finishTime?: Moment,
    instanceId?: string
}

export interface TaskQueueAction extends Action {
    type: 'ADD_TASK' | 'EXECUTE_TASK' | 'FINISH_TASK' | 'FAIL_TASK',
    payload: Task
}

export interface TaskQueueState {
    pending: { [id: string]: Task },
    active: { [id: string]: Task }
}

export interface Instance {
    id: string,
    ipAddress: string,
    startTime: Moment,
    terminatedTime?: Moment,
    normalTermination?: boolean
}

export interface InstanceAction extends Action {
    type: 'START_INSTANCE' | 'RUN_INSTANCE' | 'TERMINATE_INSTANCE',
    payload: Instance
}

export interface InstanceState {
    starting: { [id: string]: Instance },
    running: { [id: string]: Instance }
}
