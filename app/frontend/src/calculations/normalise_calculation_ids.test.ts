import { describe, test } from "datacurator-core/utils/test"
import { uuid_v4_for_tests } from "../utils/uuid_v4_for_tests"
import { normalise_calculation_ids } from "./normalise_calculation_ids"



export const test_normalise_calculation_ids = describe.delay("normalise_calculation_ids", () =>
{
    const id1 = uuid_v4_for_tests(1)
    let calculation_string = ""
    let expected_converted_calculation = ""
    let result_calculation_string = ""

    calculation_string = `[A] + 3`
    expected_converted_calculation = `[A] + 3`
    result_calculation_string = normalise_calculation_ids(calculation_string, [])
    test(result_calculation_string, expected_converted_calculation, "Original square bracket IDs ignored")

    calculation_string = `[A] + B`
    expected_converted_calculation = `[A] + [B]`
    result_calculation_string = normalise_calculation_ids(calculation_string, [])
    const skipping_auto_wrapping_square_brackets = "Skipping for now as auto wrapping in square brackets is error prone and invalidates a lot of the SimulationJS keywords, syntax, language constructs."
    test.skip(result_calculation_string, expected_converted_calculation, `${skipping_auto_wrapping_square_brackets} Non square bracket id put into square brackets`)

    calculation_string = `A + [B]`
    expected_converted_calculation = `[A] + [B]`
    result_calculation_string = normalise_calculation_ids(calculation_string, [])
    test.skip(result_calculation_string, expected_converted_calculation, `${skipping_auto_wrapping_square_brackets} Beginning with non square bracket id put into square brackets`)

    calculation_string = `A-B`
    expected_converted_calculation = `[A]-[B]`
    result_calculation_string = normalise_calculation_ids(calculation_string, [])
    test.skip(result_calculation_string, expected_converted_calculation, `${skipping_auto_wrapping_square_brackets} Non square bracket ids with no spaces and a negation sign between are put into square brackets`)

    calculation_string = `[A] + @@${id1}`
    expected_converted_calculation = `[A] + [${id1}]`
    result_calculation_string = normalise_calculation_ids(calculation_string, [id1])
    test(result_calculation_string, expected_converted_calculation, "@@ uuid id put into square brackets")

    calculation_string = `B + B`
    expected_converted_calculation = `[B] + [B]`
    result_calculation_string = normalise_calculation_ids(calculation_string, [])
    test.skip(result_calculation_string, expected_converted_calculation, `${skipping_auto_wrapping_square_brackets} Repeated non square bracket id dealt with correctly`)

    calculation_string = `sin(1) + B`
    expected_converted_calculation = `sin(1) + [B]`
    result_calculation_string = normalise_calculation_ids(calculation_string, [])
    test.skip(result_calculation_string, expected_converted_calculation, `${skipping_auto_wrapping_square_brackets} Simulation.js functions not processed into square brackets`)

    calculation_string = `A>B`
    expected_converted_calculation = `[A]>[B]`
    result_calculation_string = normalise_calculation_ids(calculation_string, [])
    test.skip(result_calculation_string, expected_converted_calculation, `${skipping_auto_wrapping_square_brackets} Simulation.js equality signs not processed into square brackets`)

    calculation_string = `[Some agent].FindAll([Some state]) + B`
    expected_converted_calculation = `[Some agent].FindAll([Some state]) + [B]`
    result_calculation_string = normalise_calculation_ids(calculation_string, [])
    test.skip(result_calculation_string, expected_converted_calculation, `${skipping_auto_wrapping_square_brackets} Simulation.js agent functions not processed into square brackets`)

    calculation_string = `[ Some variable ] + [ another variable ]`
    expected_converted_calculation = `[ Some variable ] + [ another variable ]`
    result_calculation_string = normalise_calculation_ids(calculation_string, [])
    test(result_calculation_string, expected_converted_calculation, "Existing square bracket id with spaces is not altered")

    calculation_string = `{4 miles} / {6.4e3 meters}`
    expected_converted_calculation = `{4 miles} / {6.4e3 meters}`
    result_calculation_string = normalise_calculation_ids(calculation_string, [])
    test(result_calculation_string, expected_converted_calculation, "Units inside curly braces are left unaltered")

    calculation_string = `{7 Widgets/Years^2}`
    expected_converted_calculation = `{7 Widgets/Years^2}`
    result_calculation_string = normalise_calculation_ids(calculation_string, [])
    test(result_calculation_string, expected_converted_calculation, "Compound units and those raised to power inside curly braces are left unaltered")

    calculation_string = `{@@${id1} meters}`
    expected_converted_calculation = `{[${id1}] meters}`
    result_calculation_string = normalise_calculation_ids(calculation_string, [id1])
    test.skip(result_calculation_string, expected_converted_calculation, "Skipping because Simulation.JS does not allow referencing and setting units: ~~Double @ reference uuids and their units are preserved in curly braces~~")

    calculation_string = `x <- 2
    If x > 10 Then
      'Big'
    Else
      'Small'
    End If`
    expected_converted_calculation = calculation_string
    result_calculation_string = normalise_calculation_ids(calculation_string, [])
    test(result_calculation_string, expected_converted_calculation, "Should not wrap variables, key words, or literal strings in square brackets")
})
