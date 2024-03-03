export interface Task {
    type: "@todo"
    id: number
    name: string
    description: string
    taskType: void
    preference: EPreference
    status: EStatus
    created: Date
    deadline: Date
    employees: Employee[]
}

export interface Employee {
    id: number
    fullName: string
    occupation: EOccupation
    taskList: Task[]
}

export enum EStatus {
    "novel",
    "pending",
    "completed",
    "postponed"
}

export enum EPreference {
    high = "high",
    medium = "medium",
    low = "low"
}

export enum EOccupation {
    admin = "admin",
    user = "user"
}