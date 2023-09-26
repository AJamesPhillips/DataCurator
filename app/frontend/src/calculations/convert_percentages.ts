


const numbers_with_percentages_regex = /.*?(\d*(?:\.\d+)?(?:e(?:-|\+)\d+)?\s*\%)/g

// This functionality definitely belongs inside the Simulation.js package
// https://github.com/AJamesPhillips/DataCurator/issues/239
export function convert_percentages (equation: string): string
{
    let converted_equation = equation

    const matches = [...converted_equation.matchAll(numbers_with_percentages_regex)]

    matches.forEach(match =>
    {
        const match_percentage_numbers = match[1]
        // type guard
        if (!match_percentage_numbers) return
        converted_equation = converted_equation.replace(match_percentage_numbers, "(" + match_percentage_numbers.replace(/\s*\%/, " * 0.01") + ")")
    })

    return converted_equation
}
