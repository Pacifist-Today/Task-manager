import {Employee, EPreference, Task} from "./basic_types";
import {ErrorLogger} from "../loggers/error_logger";

export enum ESort {
    bubble = "bubble",
    selection = "selection"
}

export enum ESortOptions {
    created = "created",
    deadline = "deadline",
    lowPreference = EPreference.low,
    mediumPreference = EPreference.medium,
    highPreference = EPreference.high
}

export interface ISortStrategy {
    sorting(sortType: ESort, options:ESortOptions, employeeName: Employee["taskList"]): Task[]
}

export class BubbleSortStrategy implements ISortStrategy {
    errorLogger: ErrorLogger = ErrorLogger.getErrorLogger()
    sorting(sortType: ESort, option: ESortOptions, tasks:Employee["taskList"]): Task[] {
        if (sortType !== ESort.bubble){
            this.errorLogger.writeErrorLog(new Error("Incorrect sort strategy"))
            throw new Error("Incorrect sort strategy")
        }

        if (tasks.length === 0) return []
        // if (!tasks) {
        //     this.errorLogger.writeErrorLog(new Error(("Empty Task list")))
        //     throw new Error("Empty Task list")
        // }
        if (option === ESortOptions.created || option === ESortOptions.deadline) {
            for (let i = 0, endI = tasks.length - 1; i < endI; i++) {
                let wasSwap = false
                for (let j = 0, endJ = endI - i; j < endJ; j++) {
                    if (option === ESortOptions.created) {
                        if (tasks[j] > tasks[j + 1]) {
                            [tasks[j], tasks[j + 1]] = [tasks[j + 1], tasks[j]]
                            wasSwap = true
                        }
                    } else if (option === ESortOptions.deadline) {
                        if (tasks[j] < tasks[j + 1]) {
                            [tasks[j], tasks[j + 1]] = [tasks[j + 1], tasks[j]]
                            wasSwap = true
                        }
                    }
                }
                if (!wasSwap) break
            }
        }
        else if (
            option === ESortOptions.lowPreference
            ||
            option === ESortOptions.mediumPreference
            ||
            option === ESortOptions.highPreference
        ) {
            return sortPreferenceList(option, tasks)
        }
        this.errorLogger.writeErrorLog(new Error(("Got incorrect option to sort")))
        throw new Error("Got incorrect option to sort")
    }
}

export class SelectionSortStrategy implements ISortStrategy {
    errorLogger: ErrorLogger = ErrorLogger.getErrorLogger()
    sorting(sortType: ESort, option: ESortOptions, tasks:Employee["taskList"]): Task[] {
        if (sortType !== ESort.selection) {
            this.errorLogger.writeErrorLog(new Error("Incorrect sort strategy"))
            throw new Error("Incorrect sort strategy")
        }

        if (tasks.length === 0) return []

        if (option === ESortOptions.created || option === ESortOptions.deadline) {
            for (let i = 0, l = tasks.length, k = l - 1; i < k; i++) {
                let indexMin = i
                for (let j = i + 1; j < l; j++) {
                    if (option === ESortOptions.created) {
                        if (tasks[indexMin].created > tasks[j].created) {
                            indexMin = j
                        }
                    }
                    else if (option === ESortOptions.deadline) {
                        if (tasks[indexMin].deadline < tasks[j].deadline) {
                            indexMin = j
                        }
                    }

                }
                if (indexMin !== i) {
                    [tasks[i], tasks[indexMin]] = [tasks[indexMin], tasks[i]]
                }
            }
            return tasks
        }
        else if (
            option === ESortOptions.lowPreference
            ||
            option === ESortOptions.mediumPreference
            ||
            option === ESortOptions.highPreference
        ) {
            return sortPreferenceList(option, tasks)
        }
        this.errorLogger.writeErrorLog(new Error(("Got incorrect option to sort")))
        throw new Error("Got incorrect option to sort")
    }
}

function sortPreferenceList (preference: ESortOptions, tasks: Employee["taskList"]): Task[] {
    const highPreference = tasks.filter(task => task.preference === EPreference.high)
    const mediumPreference = tasks.filter(task => task.preference === EPreference.medium)
    const lowPreference = tasks.filter(task => task.preference === EPreference.low)

    const preferenceList: Task[] = []

    if (preference === ESortOptions.highPreference) {
        preferenceList.push(...highPreference)
        preferenceList.push(...mediumPreference)
        preferenceList.push(...lowPreference)
    }
    else if (preference === ESortOptions.mediumPreference) {
        preferenceList.push(...mediumPreference)
        preferenceList.push(...highPreference)
        preferenceList.push(...lowPreference)
    } else {
        preferenceList.push(...lowPreference)
        preferenceList.push(...mediumPreference)
        preferenceList.push(...highPreference)
    }

    return preferenceList
}