import {Manager} from "../index";

interface IObservable {
    attach(observer: IObserver): void;
    detach(observer: IObserver): void;
    notify(): void;
}

interface IObserver {
    update(state: IObservable):void;
}

export abstract class Observable implements IObservable {
    private readonly observers: IObserver[] = []

    public attach(observer: IObserver): void {
        const isExist = this.observers.includes(observer)
        if (!isExist) this.observers.push(observer)
    }

    public detach(observer: IObserver): void {
        const index = this.observers.indexOf(observer)
        if (!~index) this.observers.slice(index, 1)
    }

    public notify(): void {
        for (const observer of this.observers) {
            observer.update(this)
        }
    }
}

export class StatusNotification implements IObserver {
    update(state: Manager): void {
        console.log(`Task ${state.notificationTask.name} status has changed into ${state.notificationTask.status}`)
    }
}

// class StatusChanging extends Observable{
//     constructor(public id: Task["id"], public status: EStatus) {
//         super();
//     }
//     public changeTaskStatus () {
//         this.notify()
//     }
// }