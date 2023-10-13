import { NUMBER_DISPLAY_TYPES } from "../../shared/types"



const DEFAULT_SIGNIFICANT_FIGURES = 2
export function get_default_significant_figures (calc_value: string): number
{
    const num_val = parseInt(calc_value, 10)
    return number_value_is_year(num_val) ? 4 : DEFAULT_SIGNIFICANT_FIGURES
}



export function get_default_result_display_type (calc_value: string)
{
    const num_val = parseInt(calc_value, 10)
    if (number_value_is_year(num_val)) return NUMBER_DISPLAY_TYPES.bare

    if (calc_value.trim().match(/\d+\.?\d*\s*\%/)) return NUMBER_DISPLAY_TYPES.percentage

    return NUMBER_DISPLAY_TYPES.simple
}



function number_value_is_year (num_val: number)
{
    // Making assumption that most years of interest to current debate will be between
    // 1900 and 2200
    return (Number.isSafeInteger(num_val) && num_val >= 1900 && num_val <= 2200)
}
