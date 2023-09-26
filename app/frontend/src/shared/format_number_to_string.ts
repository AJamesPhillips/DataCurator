

export enum NumberDisplayType
{
    bare,
    scaled,
    abbreviated_scaled,
    scientific
}


export function format_number_to_string (num: number, significant_figures: number, display_type: NumberDisplayType): string
{
    let formatted_number: string

    significant_figures = Math.round(significant_figures)
    significant_figures = significant_figures < 1 ? 1 : significant_figures

    if (display_type === NumberDisplayType.bare)
    {
        const rounded_number = round_to_significant_figures(num, significant_figures)
        formatted_number = Math.abs(rounded_number) < 1 ? rounded_number.toString() : rounded_number.toLocaleString()
    }
    else if (display_type === NumberDisplayType.scaled)
    {
        formatted_number = scale_number(num, significant_figures)
    }
    else if (display_type === NumberDisplayType.abbreviated_scaled)
    {
        formatted_number = abbreviate_number(num, significant_figures)
    }
    else if (display_type === NumberDisplayType.scientific)
    {
        formatted_number = num.toExponential(significant_figures - 1)
    }
    else
    {
        throw new Error(`Unimplemented display type ${display_type}`)
    }

    formatted_number = formatted_number.replace("e+", "e").trim()

    return formatted_number
}


function round_to_significant_figures (num: number, significant_figures: number): number
{
    const multiplier = Math.pow(10, significant_figures - Math.floor(Math.log10(Math.abs(num))) - 1)
    return Math.round(num * multiplier) / multiplier
}


function scale_number (num: number, significant_figures: number): string
{
    const suffixes = ["", "thousand", "million", "billion", "trillion"]
    let suffixIndex = 0

    while (Math.abs(num) >= 1000 && suffixIndex < suffixes.length - 1)
    {
        num /= 1000
        suffixIndex++
    }

    return num.toPrecision(significant_figures) + " " + suffixes[suffixIndex]
}


function abbreviate_number (num: number, significant_figures: number): string
{
    const suffixes = ["", "k", "m", "bn", "tn"]
    let suffixIndex = 0

    while (Math.abs(num) >= 1000 && suffixIndex < suffixes.length - 1)
    {
        num /= 1000
        suffixIndex++
    }

    return num.toPrecision(significant_figures) + " " + suffixes[suffixIndex]
}
