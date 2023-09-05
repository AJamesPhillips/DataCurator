// Copied from https://github.com/AJamesPhillips/utils-ts/blob/0.3.0/ts/utils.ts#L112
export function str_enum<T extends string>(o: Array<T>): {[K in T]: K} {
    return o.reduce((res, key) => {
        res[key] = key
        return res
    }, Object.create(null))
}
