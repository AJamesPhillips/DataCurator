


export function bounded (num: number, min: number, max: number): number
{
    return Math.max(Math.min(num, max), min)
}



export function rescale (num: number, min: number, max: number, domain_min: number = 0, domain_max: number = 1): number
{
    const bound = bounded(num, domain_min, domain_max)
    const ratio = (bound - domain_min) / (domain_max - domain_min)
    const result = min + (ratio * (max - min))

    return result
}
