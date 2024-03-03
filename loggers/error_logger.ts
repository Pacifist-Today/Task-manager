export class ErrorLogger {
    private static instance: ErrorLogger

    errors!: [number, Error]

    public static getErrorLogger (): ErrorLogger {
        if (!ErrorLogger.instance) {
            ErrorLogger.instance = new ErrorLogger()
        }
        return ErrorLogger.instance
    }

    private constructor() {}

    public writeErrorLog (error: Error): void {
        this.errors.push(this.errors.length + 1, error)
    }
}

