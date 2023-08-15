import { YAMLParseError, parse } from "yaml"

import { test } from "../../../shared/utils/test"
import { uuid_v4_for_tests } from "../../../utils/uuid_v4_for_tests"
import { PlainCalculationObject } from "./interfaces"



const CalculationObjectError = {
    empty_calculation: "Empty calculation object",
}


export function get_plain_calculation_object_from_str (calculation_str: string): PlainCalculationObject
{
    calculation_str = calculation_str.trim()

    let valid = true
    let value = Number.NaN
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
            errors = [e]
            break
        }

        if (typeof parsed.value === "number") value = parsed.value
        else if (typeof parsed.value === "string") value = parsed.value


        if (typeof parsed.name === "string") name = parsed.name

    } while (false)


    if (!valid || errors.length) return { valid: false, errors }
    return { valid: true, value, name }
}



function test_get_plain_calculation_object_from_str ()
{
    console. log("running tests of get_plain_calculation_object_from_str")

    let str = "  "
    let plain_calculation_object = get_plain_calculation_object_from_str(str)
    test(plain_calculation_object, { valid: false, errors: ["Empty calculation object"] }, "Should find an invalid calculation object when empty string")


    str = "value: 10"
    plain_calculation_object = get_plain_calculation_object_from_str(str)
    test(plain_calculation_object, { valid: true, value: 10 }, "Should find a number value")


    str = `value:
 10
`
    plain_calculation_object = get_plain_calculation_object_from_str(str)
    test(plain_calculation_object, { valid: true, value: 10 }, "Should find a number value when on new line")


    str = `value: >
 10
`
    plain_calculation_object = get_plain_calculation_object_from_str(str)
    // Might want to improve how this is handled at some point later?
    test(plain_calculation_object, { valid: true, value: "10\n" }, "Should find a number value as a string when in a block")


    const id1 = uuid_v4_for_tests(1)
    str = `
value: @@${id1}
`
    plain_calculation_object = get_plain_calculation_object_from_str(str)
    let invalid_YAML_error: YAMLParseError = {
        code: "BAD_SCALAR_START",
        linePos: [{ col: 8, line: 1 }, {col: 9, line: 1 }],
        message: "Plain value cannot start with reserved character @ at line 1, column 8:\n\nvalue: @@10000000-0000-4000-a000-000000000000\n       ^\n",
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
    test(plain_calculation_object, { valid: true, value: `@@${id1}` }, "Will find an uuid id")


    str = `
name: A
value: 33
`
    plain_calculation_object = get_plain_calculation_object_from_str(str)
    test(plain_calculation_object, { valid: true, value: 33, name: "A" }, "Will find a name and value")
}



function run_tests ()
{
    test_get_plain_calculation_object_from_str()
}

// run_tests()
