

export function make_calculation_safe_for_rich_text (calculation: string)
{
    return calculation.replaceAll("*", "\\*")
}
