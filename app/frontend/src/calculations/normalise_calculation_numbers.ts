


const thousands_numbers_commas_regex = /.*?\d{1,3}((?:,\d{3})+)/g

export function normalise_calculation_numbers (equation: string): string
{
    let converted_equation = equation

    const matches = [...converted_equation.matchAll(thousands_numbers_commas_regex)]
    matches.forEach(match =>
    {
        const match_comma_numbers = match[0]
        // type guard
        if (!match_comma_numbers) return
        converted_equation = converted_equation.replaceAll(match_comma_numbers, match_comma_numbers.replaceAll(",", ""))
    })

    return converted_equation
}
