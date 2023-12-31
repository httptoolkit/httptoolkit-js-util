export type MaybePromise<T> = T | Promise<T>;

export const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms)
);

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