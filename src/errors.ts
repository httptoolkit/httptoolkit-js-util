/**
 * Something that is either an actual Error, or something very similar,
 * on which we can start examining error properties.
 */
export type ErrorLike = Partial<Error> & {
    // Various properties we might want to look for on errors:
    code?: string;
    cmd?: string;
    signal?: string;
    statusCode?: number;
    statusMessage?: string;
    cause?: ErrorLike;
};

/**
 * An easy way to check if an unknown object (e.g. a catch(e) argument) is
 * actually an error-like
 */
export function isErrorLike(error: any): error is ErrorLike {
    return error && typeof error === 'object' && (
        error instanceof Error ||
        error.message ||
        error.code ||
        error.stack
    )
}

/**
 * A convenience method to make something error-ish into an actual Error instance.
 */
export function asErrorLike(error: any): ErrorLike {
    if (isErrorLike(error)) {
        return error as ErrorLike;
    } else if (error) {
        return new Error(error.message || error.toString() || '[Unknown error]');
    } else {
        return new Error('[Undefined error]');
    }
}

// Tiny wrapper to make it super easy to make custom error classes where .name behaves
// correctly, and useful metafields can be easily added.
export class CustomError extends Error implements ErrorLike {
    constructor(message?: string, extras: {
        code?: string,
        statusCode?: number,
        cause?: Error
    } = {}) {
        super(message); // 'Error' breaks prototype chain here

        // This restores the details of the real error subclass:
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);

        if (extras.code !== undefined) this.code = extras.code;
        if (extras.statusCode !== undefined) this.statusCode = extras.statusCode;
        if (extras.cause !== undefined) this.cause = extras.cause;
    }

    public readonly code?: string;
    public readonly statusCode?: number;
    public readonly cause?: Error;
}

export class StatusError extends CustomError {
    constructor(
        /**
         * Should be a valid HTTP status code
         */
        statusCode: number,
        message: string,
        extras: {
            code?: string,
            cause?: Error
        } = {}
    ) {
        super(message, { ...extras, statusCode: statusCode });
    }
}

/**
 * An error to throw in expected-never cases - by using this, you ask TypeScript to
 * be sure that it agrees that the case is truly unreachable.
 */
export class UnreachableCheck extends CustomError {

    // getValue is used to allow logging properties (e.g. v.type) on expected-unreachable
    // values, instead of just logging [object Object].
    constructor(value: never, getValue: (v: any) => any = (x => x)) {
        super(`Unhandled case value: ${getValue(value)}`);
    }

}

/**
 * A convenient expression-shaped version of UnreachableCheck
 */
export const unreachableCheck = (value: never, getValue: (v: any) => any = (x => x)): never => {
    throw new UnreachableCheck(value, getValue);
}