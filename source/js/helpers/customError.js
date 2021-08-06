export default class CustomError extends Error {
    constructor(name = "Unknown Error", message, code = "", ...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CustomError);
        }
        this.name = name;
        this.code = code;

        if (message)
            this.message = message

        // Custom debugging information
        this.date = new Date();
    }
}