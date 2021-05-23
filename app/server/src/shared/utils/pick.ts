


export function pick <O, T extends keyof O> (keys: T[], obj: O): {[A in T]: O[A]}
{
    const result: {[A in T]: O[A]} = {} as any

    keys.forEach(key => {
        result[key] = obj[key]
    })

    return result
}
