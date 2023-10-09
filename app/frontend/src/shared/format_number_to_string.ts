import { format_number_to_significant_figures } from "./format_number_to_significant_figures"


export enum NumberDisplayType
{
    bare, // only the number so that numbers like 2023 do not have a comma
    simple, // includes commas in numbers like 2,023
    scaled,
    abbreviated_scaled,
    scientific
}


export function format_number_to_string (num: number, max_significant_figures: number, display_type: NumberDisplayType): string
{
    let formatted_number: string

    max_significant_figures = Math.round(max_significant_figures)
    max_significant_figures = max_significant_figures < 1 ? 1 : max_significant_figures

    if (display_type === NumberDisplayType.bare)
    {
        const rounded_number = round_to_max_significant_figures(num, max_significant_figures)
        formatted_number = rounded_number.toString()
    }
    else if (display_type === NumberDisplayType.simple)
    {
        const rounded_number = round_to_max_significant_figures(num, max_significant_figures)
        formatted_number = Math.abs(rounded_number) < 1 ? rounded_number.toString() : rounded_number.toLocaleString()
    }
    else if (display_type === NumberDisplayType.scaled)
    {
        formatted_number = scale_number(num, max_significant_figures)
    }
    else if (display_type === NumberDisplayType.abbreviated_scaled)
    {
        formatted_number = abbreviate_number(num, max_significant_figures)
    }
    else if (display_type === NumberDisplayType.scientific)
    {
        const minimised_significant_figures = minimise_significant_figures(num, max_significant_figures)
        formatted_number = num.toExponential(minimised_significant_figures - 1)
    }
    else
    {
        throw new Error(`Unimplemented display type ${display_type}`)
    }

    formatted_number = formatted_number.replace("e+", "e").trim()

    return formatted_number
}


function round_to_max_significant_figures (num: number, max_significant_figures: number): number
{
    const multiplier = Math.pow(10, max_significant_figures - Math.floor(Math.log10(Math.abs(num))) - 1)
    return Math.round(num * multiplier) / multiplier
}


function scale_number (num: number, max_significant_figures: number): string
{
    const suffixes = ["", "thousand", "million", "billion", "trillion"]
    let suffixIndex = 0

    while (Math.abs(num) >= 1000 && suffixIndex < suffixes.length - 1)
    {
        num /= 1000
        suffixIndex++
    }

    const minimised_significant_figures = minimise_significant_figures(num, max_significant_figures)

    return format_number_to_significant_figures(num, minimised_significant_figures) + " " + suffixes[suffixIndex]
}


function abbreviate_number (num: number, max_significant_figures: number): string
{
    const suffixes = ["", "k", "m", "bn", "tn"]
    let suffixIndex = 0

    while (Math.abs(num) >= 1000 && suffixIndex < suffixes.length - 1)
    {
        num /= 1000
        suffixIndex++
    }

    const minimised_significant_figures = minimise_significant_figures(num, max_significant_figures)

    return format_number_to_significant_figures(num, minimised_significant_figures) + " " + suffixes[suffixIndex]
}


function minimise_significant_figures (num: number, max_significant_figures: number): number
{
    let minimised_significant_figures = max_significant_figures

    while (minimised_significant_figures > 1)
    {
        if (Number.parseFloat(num.toPrecision(minimised_significant_figures - 1)) === num)
        {
            --minimised_significant_figures
        }
        else
        {
            break
        }
    }

    return minimised_significant_figures
}
