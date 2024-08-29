

export function round_to_max_significant_figures (num: number, max_significant_figures: number): number
{
    if (num === 0) return 0

    const multiplier = Math.pow(10, max_significant_figures - Math.floor(Math.log10(Math.abs(num))) - 1)
    return Math.round(num * multiplier) / multiplier
}
