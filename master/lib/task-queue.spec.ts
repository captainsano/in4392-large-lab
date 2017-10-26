import 'mocha'
import {expect} from 'chai'
import * as moment from 'moment'

import {pickPendingTasks, default as taskQueue, addTask} from './task-queue'
import {Moment} from "moment";

const createEmptyTaskQueueState = function () {
    return {
        pending: {},
        active: {}
    }
}

const createMockTask = function (id: string, arrivalTime: Moment) {
    return {
        id,
        args: {},
        arrivalTime,
        retries: -1
    }
}

describe('Task queue', () => {

    describe('reducer', () => {
        it.skip('ADD_TASK', () => {
        })

        it.skip('EXECUTE_TASK', () => {
        })

        it.skip('FINISH_TASK', () => {
        })

        it.skip('FAIL_TASK', () => {
        })
    })

    describe('util functions', () => {
        describe('pick 1 task from pending queue', () => {
            it('should return empty for empty queue', () => {
                const taskQueueState = createEmptyTaskQueueState()

                const pickedTasks = pickPendingTasks(taskQueueState, 1)
                expect(pickedTasks).to.be.empty
            })

            it('should return only task in queue', () => {
                const mockTask1 = createMockTask('1', moment().subtract(1, 'day'))
                const taskQueueState = {
                    ...createEmptyTaskQueueState(),
                    pending: {'1': mockTask1},
                }

                const pickedTasks = pickPendingTasks(taskQueueState, 1)
                expect(pickedTasks).to.be.of.length(1)
                expect(pickedTasks[0]).to.eql(mockTask1)
            })

            it('should return the earliest in the list', () => {
                const mockTask1 = createMockTask('1', moment().subtract(5, 'seconds'))
                const mockTask2 = createMockTask('2', moment().subtract(7, 'seconds'))
                const mockTask3 = createMockTask('3', moment().subtract(3, 'seconds'))

                const taskQueueState = {
                    ...createEmptyTaskQueueState(),
                    pending: {'1': mockTask1, '2': mockTask2, '3': mockTask3},
                }

                const pickedTasks = pickPendingTasks(taskQueueState, 1)
                expect(pickedTasks).to.be.of.length(1)
                expect(pickedTasks[0]).to.eql(mockTask2)
            })
        })

        describe('pick 3 tasks from pending queue', () => {
            it('should pick earliest 3 tasks', () => {
                const mockTask1 = createMockTask('1', moment().subtract(5, 'seconds'))
                const mockTask2 = createMockTask('2', moment().subtract(7, 'seconds'))
                const mockTask3 = createMockTask('3', moment().subtract(3, 'seconds'))
                const mockTask4 = createMockTask('4', moment().subtract(9, 'seconds'))
                const mockTask5 = createMockTask('5', moment().subtract(1, 'seconds'))
                const mockTask6 = createMockTask('6', moment().subtract(2, 'seconds'))

                const taskQueueState = {
                    ...createEmptyTaskQueueState(),
                    pending: {
                        '1': mockTask1,
                        '2': mockTask2,
                        '3': mockTask3,
                        '4': mockTask4,
                        '5': mockTask5,
                        '6': mockTask6
                    }
                }

                const pickedTasks = pickPendingTasks(taskQueueState, 3)
                expect(pickedTasks).to.be.of.length(3)
                expect(pickedTasks[0]).to.eql(mockTask4)
                expect(pickedTasks[1]).to.eql(mockTask2)
                expect(pickedTasks[2]).to.eql(mockTask1)
            })
        })
    })
})
