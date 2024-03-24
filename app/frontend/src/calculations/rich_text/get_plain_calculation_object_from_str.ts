import { YAMLParseError, parse } from "yaml"

import { describe, test } from "../../shared/utils/test"
import { uuid_v4_for_tests } from "../../utils/uuid_v4_for_tests"
import { PlainCalculationObjectV1 } from "../interfaces"



const CalculationObjectError = {
    empty_calculation: "Empty calculation",
    calculation_missing_value: "Calculation missing value attribute",
}


/**
 *
 * @deprecated for now as replace_calculations_with_results is @deprecated
 */
export function get_plain_calculation_object_from_str (calculation_str: string): PlainCalculationObjectV1
{
    calculation_str = calculation_str.trim()

    let valid = true
    let value: string | number = Number.NaN
    let name: undefined | string = undefined
    let errors: (string | YAMLParseError)[] = []

    do
    {
        if (!calculation_str)
        {
            errors = [CalculationObjectError.empty_calculation]
            break
        }

        let parsed: any
        try
        {
            parsed = parse(calculation_str, { intAsBigInt: false })
        }
        catch (e: any)
        {
            let message = e.message as string
            // This helps user debug issues as, for example, if they currently
            // use unquoted ids like:
            //
            //     $$!
            //     value: @@1235-uuidv4-id
            //     $$!
            //
            // Then these ids are rendered in the YAMLParse error but without
            // the following line of code they would then be replaced with a
            // link to the wcomponent.
            message = message.replaceAll("@@", "\\@\\@")
            message = message.replaceAll(/^(?<replace>(?:\s\s)+)(?<post>\s?\^)/gm, (...args) =>
            {
                const { replace, post } = args[5]
                const result = "&nbsp; ".repeat(replace.length / 2) + post
                // Note there's something strange about the display of &nbsp;
                // in <code> blocks in Firefox in that sometimes it looks like
                // an extra space is included or ignored.
                return result.replace("  ", " &nbsp;")
            })

            // Remove double newlines so that when placed into <code></code>
            // blocks then markdown-to-jsx will not incorrectly break
            // <code></code> block by inserting seperate <p></p> blocks
            message = message.replaceAll("\n\n", "\n")

            // mutate message of error object
            e.message = message

            errors = [e]
            break
        }


        const parsed_value = parsed.value
        if (typeof parsed_value === "number") value = parsed_value
        else if (typeof parsed_value === "string") value = parsed_value


        if (typeof parsed.name === "string") name = parsed.name


        if (Number.isNaN(value)) errors.push(CalculationObjectError.calculation_missing_value)

    } while (false)


    if (!valid || errors.length) return { valid: false, errors }
    return { valid: true, value, name }
}



export const run_get_plain_calculation_object_from_str_tests = describe.skip("Skipped for now as `replace_calculations_with_results` is @deprecated; get_plain_calculation_object_from_str", () =>
{
    let str = "  "
    let plain_calculation_object = get_plain_calculation_object_from_str(str)
    test(plain_calculation_object, { valid: false, errors: ["Empty calculation"] }, "Should find an invalid calculation object when empty string")


    str = "value: 10"
    plain_calculation_object = get_plain_calculation_object_from_str(str)
    test(plain_calculation_object, { name: undefined, valid: true, value: 10 }, "Should find a number value")


    str = `value:
 10
`
    plain_calculation_object = get_plain_calculation_object_from_str(str)
    test(plain_calculation_object, { name: undefined, valid: true, value: 10 }, "Should find a number value when on new line")


    str = `value: >
 10
`
    plain_calculation_object = get_plain_calculation_object_from_str(str)
    // Might want to improve how this is handled at some point later?
    test(plain_calculation_object, { name: undefined, valid: true, value: "10\n" }, "Should find a number value as a string when in a block")


    const id1 = uuid_v4_for_tests(1)
    str = `
value: @@${id1}
`
    plain_calculation_object = get_plain_calculation_object_from_str(str)
    let invalid_YAML_error: YAMLParseError = {
        code: "BAD_SCALAR_START",
        linePos: [{ col: 8, line: 1 }, {col: 9, line: 1 }],
        message: "Plain value cannot start with reserved character @ at line 1, column 8:\nvalue: \\@\\@10000000-0000-4000-a000-000000000000\n&nbsp; &nbsp; &nbsp; &nbsp;^\n",
        name: "YAMLParseError",
        pos: [7, 8],
    }
    // It would be preferable for this test to pass but for now let's keep with
    // valid YAML even though it makes this use case uglier / less user friendly
    test(plain_calculation_object, { valid: false, errors: [invalid_YAML_error] }, "Will error on finding an unquoted uuid id")


    str = `
value: "@@${id1}"
`
    plain_calculation_object = get_plain_calculation_object_from_str(str)
    test(plain_calculation_object, { name: undefined, valid: true, value: `@@${id1}` }, "Will find an uuid id")


    str = `
name: A
value: 33
`
    plain_calculation_object = get_plain_calculation_object_from_str(str)
    test(plain_calculation_object, { valid: true, value: 33, name: "A" }, "Will find a name and value")

}, false)
