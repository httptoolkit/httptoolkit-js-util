export type MaybePromise<T> = T | Promise<T>;

export const delay = (ms: number, options: {
    /**
     * If set, if the code is running in a compatible runtime (i.e. Node.js)
     * then the .unref() will be used to ensure that this delay does not
     * block the process shutdown.
     */
    unref?: boolean
} = {}) =>
    new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, ms);

        if (options.unref && (timer as any).unref) {
            (timer as any).unref();
        }
    });

export async function doWhile<T>(
    doFn: () => Promise<T>,
    whileFn: () => Promise<boolean> | boolean
) {
    do {
        await doFn();
    } while (await whileFn());
}

/**
 * A deferred is a promise (you can await it directly) but also exposes the promise
 * explicitly at .promise, and exposes public resolve & reject callbacks for external
 * resolution.
 */
export interface Deferred<T> extends Promise<T> {
    resolve: (arg: T) => void,
    reject: (e: Error) => void,
    promise: Promise<T>
}

export function getDeferred<T = void>(): Deferred<T> {
    let resolve!: ((arg: T) => void);
    let reject!: ((e: Error) => void);

    const promise = new Promise<T>((resolveCb, rejectCb) => {
        resolve = resolveCb;
        reject = rejectCb;
    });

    return Object.assign(promise, { resolve, reject, promise });
}

/**
 * Wrap a function, so that any parallel calls which happen while the async function
 * is pending return the same value as the first call (so the function is only run
 * once, but the result is shared). This is useful for expensive async functions or
 * race conditions. This ignores arguments completely, and is only applicable for
 * functions that don't need any other input.
 */
export function combineParallelCalls<T>(fn: () => Promise<T>): () => Promise<T> {
    let pendingPromise: Promise<T> | undefined;

    return () => {
        if (pendingPromise === undefined) {
            pendingPromise = fn().finally(() => {
                pendingPromise = undefined;
            });
        }

        return pendingPromise;
    };
}