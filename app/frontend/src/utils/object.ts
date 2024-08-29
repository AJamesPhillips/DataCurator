
// See https://stackoverflow.com/a/66170988/539490
export function safe_merge<
    O1,
    O2 extends { [K2 in keyof O2]: K2 extends keyof O1 ? never : O2[K2] },
    O3 extends { [K3 in keyof O3]: K3 extends keyof O1 ? never : (K3 extends keyof O2 ? never : O3[K3]) },
    O4 extends { [K4 in keyof O4]: K4 extends keyof O1 ? never : (K4 extends keyof O2 ? never : (K4 extends keyof O3 ? never : O4[K4])) },
    O5 extends { [K5 in keyof O5]: K5 extends keyof O1 ? never : (K5 extends keyof O2 ? never : (K5 extends keyof O3 ? never : ( K5 extends keyof O4 ? never : O5[K5]))) },
    O6 extends { [K6 in keyof O6]: K6 extends keyof O1 ? never : (K6 extends keyof O2 ? never : (K6 extends keyof O3 ? never : ( K6 extends keyof O4 ? never : (K6 extends keyof O5 ? never : O6[K6])))) },
    O7 extends { [K7 in keyof O7]: K7 extends keyof O1 ? never : (K7 extends keyof O2 ? never : (K7 extends keyof O3 ? never : ( K7 extends keyof O4 ? never : (K7 extends keyof O5 ? never : (K7 extends keyof O6 ? never : O7[K7]))))) },
    O8 extends { [K8 in keyof O8]: K8 extends keyof O1 ? never : (K8 extends keyof O2 ? never : (K8 extends keyof O3 ? never : ( K8 extends keyof O4 ? never : (K8 extends keyof O5 ? never : (K8 extends keyof O6 ? never : (K8 extends keyof O7 ? never : O8[K8])))))) },
    O9 extends { [K9 in keyof O9]: K9 extends keyof O1 ? never : (K9 extends keyof O2 ? never : (K9 extends keyof O3 ? never : ( K9 extends keyof O4 ? never : (K9 extends keyof O5 ? never : (K9 extends keyof O6 ? never : (K9 extends keyof O7 ? never : (K9 extends keyof O8 ? never : O9[K9]))))))) },
>(
    o1: O1,
    o2: O2 = ({} as any),
    o3: O3 = ({} as any),
    o4: O4 = ({} as any),
    o5: O5 = ({} as any),
    o6: O6 = ({} as any),
    o7: O7 = ({} as any),
    o8: O8 = ({} as any),
    o9: O9 = ({} as any),
): O1 & O2 & O3 & O4 & O5 & O6 & O7 & O8 & O9 {
    return { ...o1, ...o2, ...o3, ...o4, ...o5, ...o6, ...o7, ...o8, ...o9 }
}



export function find_match_by_inclusion_of_key <O extends object> (str: string, dictionary: O): undefined | [keyof O, O[keyof O]]
{
    const pair = Object.entries(dictionary)
        .find(([root]) => str.includes(root))

    return pair as any
}



// https://stackoverflow.com/a/56403542/539490
// https://github.com/joonhocho/tsdef/blob/9956206/src/index.ts#L222-L226
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer I>
        ? Array<DeepPartial<I>>
        : DeepPartial<T[P]>
}


// Quick but fragile implementation
// todo: add tests once this starts failing
export function deep_clone <T extends any> (obj: T): T
{
    return JSON.parse(JSON.stringify(obj))
}
