import { Employee, Task, EStatus } from "../modules/basic_types"
import { ErrorLogger } from "../loggers/error_logger";

export class Database {
    private static instance: Database

    tasks = new Map<Task["id"], Task>()
    employees = new Map<Employee["fullName"], Employee>()
    private errorLogger = ErrorLogger.getErrorLogger()

    public static getDatabase (): Database {
        if (!Database.instance) {
            Database.instance = new Database()
        }
        return Database.instance
    }

    private constructor (){}

    public addTask (task: Task): void {
        if (this.tasks.has(task.id)) {
            this.errorLogger.writeErrorLog(new Error("task has been already created"))
            throw new Error("task has been already created")
        }

        task.id = this.tasks.size + 1

        this.tasks.set(task.id, task)
    }

    public deleteTask (id: Task["id"]): void {
        const task = this.tasks.get(id)

        if (!task) {
            this.errorLogger.writeErrorLog(new Error(`You can't delete Task ${id}, it doesn't exist`))
            throw new Error(`You can't delete Task ${id}, it doesn't exist`)
        }

        task.employees.map(worker => {
            if (this.employees.has(worker.fullName)) {
                let employee = this.employees.get(worker.fullName)

                if (!employee) {
                    this.errorLogger.writeErrorLog(new Error(`Current employee ${worker.fullName} doesn't exist`))
                    throw new Error(`Current employee ${worker.fullName} doesn't exist`)
                }

                employee.taskList.filter(el => el.id !== id)
                this.employees.set(employee.fullName, employee)
            }
        })

        this.tasks.delete(id)
    }

    public editTask (task: Task): void {
        if (!this.tasks.has(task.id)) {
            this.errorLogger.writeErrorLog(new Error(`You can't edit Task ${task.id}, it doesn't exist`))
            throw new Error(`You can't edit Task ${task.id}, it doesn't exist`)
        }

        task.employees.map(worker => {
            if (this.employees.has(worker.fullName)) {
                let employee = this.employees.get(worker.fullName)

                if (!employee) {
                    this.errorLogger.writeErrorLog(new Error(`${worker.fullName} doesn't exist`))
                    throw new Error(`${worker.fullName} doesn't exist`)
                }

                const index = employee.taskList.findIndex(el => el.id === task.id)
                employee.taskList[index] = task
                this.employees.set(employee.fullName, employee)
            }
        })

        this.tasks.set(task.id, task)
    }

    public getTask (id: Task["id"], fullName: Employee["fullName"]): Task {
        const task = this.tasks.get(id)

        if (!task) {
            this.errorLogger.writeErrorLog(new Error(`Can't find task ${id}`))
            throw new Error(`Can't find task ${id}`)
        }

        const worker = task.employees.find(employee => employee.fullName === fullName)

        if (!worker) {
            this.errorLogger.writeErrorLog(new Error(`This task doesn't under permission ${fullName}`))
            throw new Error(`This task doesn't under permission ${fullName}`)
        }

        return task
    }

    public getTaskList (name: Employee["fullName"]): Task[] {
        const tasks = this.employees.get(name)

        if (!tasks) return []

        return tasks.taskList
    }

    public getAllTasks (): Task[] {
        return Array.from(this.tasks).map(task => task[1])
    }

    public assignEmployee (id: Task["id"], employee: Employee["fullName"] | Employee["fullName"][]): void {
        const task = this.tasks.get(id)

        if (!task) {
            this.errorLogger.writeErrorLog(new Error(`Task ${id} doesn't exist`))
            throw new Error(`Task ${id} doesn't exist`)
        }

        // if 1 employee
        if (typeof employee === "string") {
            const worker = this.employees.get(employee)

            if (!worker) {
                this.errorLogger.writeErrorLog(new Error(`Employee ${employee} doesn't exist`))
                throw new Error(`Employee ${employee} doesn't exist`)
            }

            worker.taskList.push(task)

            this.employees.set(worker.fullName, worker)

            task.employees.push(worker)

            this.tasks.set(id, task)

        } //if many employees
        else if (Array.isArray(employee)) {
            employee.map(worker => {
                const professional = this.employees.get(worker)

                if (!professional) {
                    this.errorLogger.writeErrorLog(new Error(`Employee ${employee} doesn't exist`))
                    throw new Error(`Employee ${employee} doesn't exist`)
                }

                professional.taskList.push(task)

                this.employees.set(professional.fullName, professional)

                task.employees.push(professional)

                this.tasks.set(id, task)
            })
        }
    }

    public changeTaskStatus (id: Task["id"], status: EStatus): void {
        let task: Task | undefined = this.tasks.get(id)

        if (!task)  {
            this.errorLogger.writeErrorLog(new Error(`Task ${id} doesn't exist`))
            throw new Error(`Task ${id} doesn't exist`)
        }

        if (!task.employees && (status === EStatus.pending || status === EStatus.completed)) {
            this.errorLogger.writeErrorLog(new Error("Can't change status, no one doing this task, assign employee!"))
            throw new Error("Can't change status, no one doing this task, assign employee!")
        }

        task.status = status

        this.tasks.set(id, task)

        task.employees.map(worker => {
            const labour = this.employees.get(worker.fullName)

            if (!labour) {
                this.errorLogger.writeErrorLog(new Error(`${worker.fullName} doesn't exist`))
                throw new Error(`${worker.fullName} doesn't exist`)
            }

            const taskIndex = labour.taskList.findIndex(goal => goal.id === id)

            if (taskIndex === -1) {
                this.errorLogger.writeErrorLog(new Error(`Task doesn't exist`))
                throw new Error(`Task doesn't exist`)
            }

            labour.taskList[taskIndex] = task

            this.employees.set(worker.fullName, labour)
        })

        // @todo change logs
    }

    public addEmployee (employee: Employee): void {
        employee.id = this.employees.size + 1

        this.employees.set(employee["fullName"], employee)
    }

    public removeEmployee (name: Employee["fullName"]): Employee {
        return this.transferData(name)

        // const employee = this.employees.get(name)
        //
        // if (!employee) throw new Error("Can't find employee")
        //
        // const activeTasks = employee.taskList.filter(task => task.status !== EStatus.completed)
        //
        // const employees: Employee[] = Array.from(this.employees).map(el => el[1])
        //
        // let transferName: Employee["fullName"] | undefined
        // let quantityTasks: number
        //
        // const worker = employees.map(emp => {
        //     if (emp.taskList.length < quantityTasks) {
        //         emp.taskList.length
        //         transferName = emp.fullName
        //     }
        // })
        //
        // if (!transferName) throw new Error("Can't transfer tasks")
        //
        // const transferEmployee: Employee | undefined = this.employees.get(transferName)
        //
        // if (!transferEmployee) throw new Error("Can't find employee")
        //
        // transferEmployee.taskList.push(...activeTasks)
        //
        // this.employees.delete(name)
        //
        // return employee
    }

    public changeOccupation (name: Employee["fullName"], occupation: Employee["occupation"]): Employee {
        return this.transferData(name, occupation)

        // const employee = this.employees.get(name)
        //
        // if (!employee) throw new Error("Can't find employee")
        //
        // const activeTasks = employee.taskList.filter(task => task.status !== EStatus.completed)
        //
        // const employees: Employee[] = Array.from(this.employees).map(el => el[1])
        //
        // let transferName: Employee["fullName"] | undefined
        // let quantityTasks: number
        //
        // const worker = employees.map(emp => {
        //     if (emp.taskList.length < quantityTasks) {
        //         emp.taskList.length
        //         transferName = emp.fullName
        //     }
        // })
        //
        // if (!transferName) throw new Error("Can't transfer tasks")
        //
        // const transferEmployee: Employee | undefined = this.employees.get(transferName)
        //
        // if (!transferEmployee) throw new Error("Can't find employee")
        //
        // transferEmployee.taskList.push(...activeTasks)
        //

        // employee.taskList = []
        // employee.occupation = occupation
        //
        // this.employees.set(name, employee)
    }

    private transferData (name: Employee["fullName"], occupation?: Employee["occupation"]): Employee {
        const employee: Employee | undefined = this.employees.get(name)

        if (!employee) {
            this.errorLogger.writeErrorLog(new Error(`Can't find employee ${name}`))
            throw new Error("Can't find employee")
        }

        const activeTasks = employee.taskList.filter(task => task.status !== EStatus.completed)

        const employees: Employee[] = Array.from(this.employees).map(el => el[1])

        let transferName: Employee["fullName"] | undefined
        let quantityTasks: number

        const worker = employees.map(emp => {
            if (emp.taskList.length < quantityTasks) {
                emp.taskList.length
                transferName = emp.fullName
            }
        })

        if (!transferName) {
            this.errorLogger.writeErrorLog(new Error(`Can't transfer tasks on ${transferName}`))
            throw new Error(`Can't transfer tasks on ${transferName}`)
        }

        const transferEmployee: Employee | undefined = this.employees.get(transferName)

        if (!transferEmployee) {
            this.errorLogger.writeErrorLog(new Error(`Can't find employee`))
            throw new Error("Can't find employee")
        }

        transferEmployee.taskList.push(...activeTasks)

        this.employees.set(transferName, transferEmployee)

        if (!occupation) {
            this.employees.delete(name)

            return employee
        } else {
            employee.taskList = []
            employee.occupation = occupation

            this.employees.set(name, employee)

            return employee
        }
    }
}