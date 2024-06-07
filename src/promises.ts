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

export interface Deferred<T> {
    resolve: (arg: T) => void,
    reject: (e?: Error) => void,
    promise: Promise<T>
}

export function getDeferred<T = void>(): Deferred<T> {
    let resolve: undefined | ((arg: T) => void) = undefined;
    let reject: undefined | ((e?: Error) => void) = undefined;

    let promise = new Promise<T>((resolveCb, rejectCb) => {
        resolve = resolveCb;
        reject = rejectCb;
    });

    // TS thinks we're using these before they're assigned, which is why
    // we need the undefined types, and the any here.
    return { resolve, reject, promise } as any;
}