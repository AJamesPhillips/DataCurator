import * as _ from "lodash"

export function as_bool (value: string | undefined | null): boolean {

    value = value && value.toLowerCase && value.toLowerCase()
    if (value === "1" || value === "true" || value === "yes") {
        return true
    }
    else if (value === "0" || value === "false" || value === "no") {
        return false
    }
    throw new Error(`Unsupported bool value: "${value}"`)
}

function from_bash_safe_strings (value: string): string
function from_bash_safe_strings (value: undefined): undefined
function from_bash_safe_strings (value: string | undefined): string | undefined
function from_bash_safe_strings (value: string | undefined): string | undefined {

    if (value && value[0] === "\"") {
        value = value.substr(1, value.length - 1)
    }

    return value
}

export function as_string (value: string | undefined) {

    value = from_bash_safe_strings(value)
    if (value === undefined) {
        throw new Error("String value undefined")
    }
    return value
}

export function as_int (value: string | undefined) {

    // Setting default of -10 allows us to find all missing values before erroring.
    const result = parseInt(value || "", 10)
    if (_.isNaN(result) || !_.isNumber(result)) {
        throw new Error(`Unsupported int value: "${value}"`)
    }

    return result
}

export function as_string_array (value: string) {

    let return_value: string[] = []
    if (value === undefined) {
        throw new Error(`Unsupported string array value: "${value}"`)
    }
    let value_str = from_bash_safe_strings(value)
    return_value = value_str.split(",")

    return return_value
}
