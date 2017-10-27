import * as R from 'ramda'
import {Instance, InstanceAction, InstanceState} from './types'

const INIT_STATE: InstanceState = {
    starting: {},
    running: {}
}

export default function instances(state = INIT_STATE, {type, payload}: InstanceAction) {
    switch (type) {
        case 'START_INSTANCE': {
            return R.assocPath(
                ['starting', payload.id],
                R.dissoc('id', payload)
            )(state) as InstanceState
        }

        case 'RUN_INSTANCE':
            return R.compose(
                R.assocPath(['running', payload.id], R.dissoc('id', payload)),
                R.dissocPath(['starting', payload.id])
            )(state) as InstanceState

        case 'TERMINATE_INSTANCE':
            return R.dissocPath(
                ['running', payload.id],
                state
            ) as InstanceState

        default:
            return state
    }
}

// Action creators
export function startInstance(instance: Instance): InstanceAction {
    return {
        type: 'START_INSTANCE',
        payload: instance
    }
}

export function runInstance(instance: Instance): InstanceAction {
    return {
        type: 'RUN_INSTANCE',
        payload: instance
    }
}

export function terminateInstance(instance: Instance): InstanceAction {
    return {
        type: 'TERMINATE_INSTANCE',
        payload: instance
    }
}