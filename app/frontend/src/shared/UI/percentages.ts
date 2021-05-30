import { bounded } from "../utils/bounded"



export function percentage_to_string (value: number | undefined): string
{
    if (value === undefined) return ""

    const percent = bounded(value, 0, 1) * 100

    return (percent).toPrecision(percent < 98 ? 2 : 3)
}
