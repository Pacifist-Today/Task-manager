import {Employee, EPreference, EStatus, Task} from "./default_types";
import {Database} from "../data/database";
import {ESort, ESortOptions} from "./sorts";

export enum EFilterStrategies {
    and = "and"
}

export interface IFilterOptions {
    // @todo Type Story, Bug, Task
    preference: EPreference
    status: EStatus
    created: [Date, Date],
    employee: Employee["fullName"]
}

export interface IFilterStrategy {
    filtering(filteringType: EFilterStrategies, options:IFilterOptions, employeeName: Employee["taskList"]): Task[]
}

export class ANDFilter {
    filtering (type: EFilterStrategies, options: IFilterOptions, tasks: Employee["taskList"]): Task[] {
        if (type !== EFilterStrategies.and) throw new Error("Incorrect sort strategy")
        if (!tasks) throw new Error("Empty Task list")

        const {preference, status, created, employee} = options

        tasks.filter(el => {
            let flag = true
            if (el.created < created[0] && el.created > created[1]) {
                flag = false
            }
            if (el.preference !== preference) {
                flag = false
            }
            if (el.status !== status) {
                flag = false
            }
            const coworker = el.employees
                .filter(worker => worker.fullName === employee)
            if (!coworker) flag = false
            if (flag) return el
        })

        return tasks
    }
}