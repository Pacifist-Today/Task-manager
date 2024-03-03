import {Employee, EPreference, EStatus, Task} from "./basic_types";
import {ErrorLogger} from "../loggers/error_logger";

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
    errorLogger: ErrorLogger = ErrorLogger.getErrorLogger()

    filtering (type: EFilterStrategies, options: IFilterOptions, tasks: Employee["taskList"]): Task[] {
        if (type !== EFilterStrategies.and) {
            this.errorLogger.writeErrorLog(new Error("Incorrect sort strategy"))
            throw new Error("Incorrect sort strategy")
        }
        if (!tasks) {
            this.errorLogger.writeErrorLog(new Error("Empty Task list"))
            throw new Error("Empty Task list")
        }

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