import { bounded } from "../shared/utils/bounded";



export function ratio_to_percentage_string (value: number | undefined): string
{
    if (value === undefined) return ""

    const percent = bounded(value, 0, 1) * 100

    return (percent).toPrecision(percent < 98 ? 2 : 3)
        .replace(/\.0$/, ""); // hide trailing .0 of 99.0
}
