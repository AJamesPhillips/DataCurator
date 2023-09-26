


export function format_number_to_significant_figures (num: number, significant_figures: number)
{
    if (num === 0) return "0"

    const num_exponent = Math.floor(Math.log10(Math.abs(num)))
    const exponent = num_exponent + 1 - significant_figures
    const rounded_number = Math.round(num / Math.pow(10, exponent)) * Math.pow(10, exponent)
    const rounded_number_string = rounded_number.toString()

    if (exponent >= 0)
    {
        return rounded_number_string
    }
    else
    {
        const decimal_index = rounded_number_string.indexOf(".")
        const has_decimal = decimal_index !== -1
        let rounded_number_string_padded_zeros = rounded_number_string + (has_decimal ? "" : ".")

        const length_of_significant_figures = ((Math.abs(num) >= 1
            ? rounded_number_string_padded_zeros.length
            : rounded_number_string_padded_zeros.length + num_exponent
        )
            - 1 // for decimal point
            - (num < 0 ? 1 : 0) // for negative sign at beginning
        )
        let trailing_zeros_needed = significant_figures - length_of_significant_figures
        trailing_zeros_needed = Math.max(0, trailing_zeros_needed) // guards against when number is coerced to 0.013000000000000001

        rounded_number_string_padded_zeros += "0".repeat(trailing_zeros_needed)

        // guards against when number is coerced to 0.013000000000000001
        const expected_final_length = (
            significant_figures +
            // accounts initial zeros at the start of a number <1 and >-1 e.g. the 0.000 of 0.000123
            (num_exponent < 0 ? -num_exponent : 0)
            + 1 // for decimal point
            + (num < 0 ? 1 : 0) // for negative sign at beginning
        )
        rounded_number_string_padded_zeros = rounded_number_string_padded_zeros.slice(0, expected_final_length)


        return rounded_number_string_padded_zeros
    }
}
