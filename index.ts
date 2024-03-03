import {Database} from "./data/database"
import {Employee, EOccupation, EPreference, EStatus, Task} from "./modules/default_types"
import {Observable, StatusNotification} from "./modules/notifications";
import {BubbleSortStrategy, ESort, ESortOptions, ISortStrategy} from "./modules/sorts";
import {ANDFilter, EFilterStrategies, IFilterOptions, IFilterStrategy} from "./modules/filter"

export class Manager extends Observable {
    private database = Database.getDatabase()
    occupation: Employee["occupation"]
    fullName: Employee["fullName"]
    notificationTask!: Task

    private _sortStrategy!: ISortStrategy
    private _filterStrategy!: IFilterStrategy

    constructor(employeeName: Employee["fullName"], occupation: Employee["occupation"]) {
        super()
        this.occupation = occupation
        this.fullName = employeeName
    }

    public add (task: Task): void {
        if (this.occupation !== EOccupation.admin) {
            throw new Error("You can't do this without admin's permission")
        }
        this.database.addTask(task)
    }

    public edit (task: Task): void {
        if (this.occupation !== EOccupation.admin) {
            throw new Error("You can't do this without admin's permission")
        }
        this.database.editTask(task)
    }

    public remove (id: Task["id"]): void {
        if (this.occupation !== EOccupation.admin) {
            throw new Error("You can't do this without admin's permission")
        }
        this.database.deleteTask(id)
    }

    public getTask (id: Task["id"]): Task {
        return this.database.getTask(id, this.fullName)
    }

    public getTasks (): Task[] {
        return this.database.getTaskList(this.fullName)
    }

    public assignEmployee (id: Task["id"], employee: Employee["fullName"] | Employee["fullName"][]): void {
        if (this.occupation !== EOccupation.admin) {
            throw new Error("You can't do this without admin's permission")
        }
        this.database.assignEmployee(id, employee)
    }

    public changeTaskStatus (id: Task["id"], status: EStatus) {
        if (this.occupation !== EOccupation.admin) {
            throw new Error("You can't do this without admin's permission")
        }
        this.database.changeTaskStatus(id, status)

        this.notificationTask = this.getTask(id)

        this.notify()
    }

    // Employee Manager

    public addEmployee (employee: Employee): void {
        this.database.addEmployee(employee)
    }

    public removeEmployee (name: Employee["fullName"]): void {
        this.database.removeEmployee(name)
    }

    public changeOccupation (name: Employee["fullName"], occupation: Employee["occupation"]) {
        this.database.changeOccupation(name, occupation)
    }

    public set sortStrategy (strategy: ISortStrategy) {
        this._sortStrategy = strategy
    }

    public sort (sortType: ESort, options: ESortOptions): Task[] {
        const employee = this.getTasks()

        const tasks: Task[] = this._sortStrategy.sorting(
            sortType,
            options,
            employee
        )

        return tasks
    }

    set filterStrategy (strategy: IFilterStrategy) {
        this._filterStrategy = strategy
    }

    public filter (filterType: EFilterStrategies, options: IFilterOptions): Task[] {
        const employee = this.getTasks()

        const tasks: Task[] = this._filterStrategy.filtering(
            filterType,
            options,
            employee
        )

        return tasks
    }
}

const manager = new Manager("John Smith", EOccupation.admin)

// Notification
const statusNotification = new StatusNotification()

manager.attach(statusNotification)

// Sort Strategy
manager.sortStrategy = new BubbleSortStrategy()

// Bubble sort strategy
manager.sort(ESort.bubble, ESortOptions.created)

// Filter Strategy
manager.filterStrategy = new ANDFilter()

manager.filter(
    EFilterStrategies.and,
    {
    preference: EPreference.high,
    status: EStatus.pending,
    created: [new Date, new Date],
    employee: "John Smith"
})