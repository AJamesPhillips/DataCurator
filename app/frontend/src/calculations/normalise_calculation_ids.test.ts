import { describe, test } from "../shared/utils/test"
import { uuid_v4_for_tests } from "../utils/uuid_v4_for_tests"
import { normalise_calculation_ids_and_extract_uuids } from "./normalise_calculation_ids"



export const run_normalise_calculation_ids_and_extract_uuids_tests = describe("normalise_calculation_ids_and_extract_uuids", () =>
{
    const id1 = uuid_v4_for_tests(1)
    let calculation_string = `[A] + 3`
    let expected_converted_calculation = `[A] + 3`
    let result_calculation_string = normalise_calculation_ids_and_extract_uuids(calculation_string).converted_calculation
    test(result_calculation_string, expected_converted_calculation, "Original square bracket IDs ignored")

    calculation_string = `[A] + B`
    expected_converted_calculation = `[A] + [B]`
    result_calculation_string = normalise_calculation_ids_and_extract_uuids(calculation_string).converted_calculation
    test(result_calculation_string, expected_converted_calculation, "Non square bracket id put into square brackets")

    calculation_string = `A + [B]`
    expected_converted_calculation = `[A] + [B]`
    result_calculation_string = normalise_calculation_ids_and_extract_uuids(calculation_string).converted_calculation
    test(result_calculation_string, expected_converted_calculation, "Beginning with non square bracket id put into square brackets")

    calculation_string = `A-B`
    expected_converted_calculation = `[A]-[B]`
    result_calculation_string = normalise_calculation_ids_and_extract_uuids(calculation_string).converted_calculation
    test(result_calculation_string, expected_converted_calculation, "Non square bracket ids with no spaces and a negation sign between are put into square brackets")

    calculation_string = `[A] + @@${id1}`
    expected_converted_calculation = `[A] + [${id1}]`
    result_calculation_string = normalise_calculation_ids_and_extract_uuids(calculation_string).converted_calculation
    test(result_calculation_string, expected_converted_calculation, "@@ uuid id put into square brackets")

    calculation_string = `B + B`
    expected_converted_calculation = `[B] + [B]`
    result_calculation_string = normalise_calculation_ids_and_extract_uuids(calculation_string).converted_calculation
    test(result_calculation_string, expected_converted_calculation, "Repeated non square bracket id dealt with correctly")

    calculation_string = `sin(1) + B`
    expected_converted_calculation = `sin(1) + [B]`
    result_calculation_string = normalise_calculation_ids_and_extract_uuids(calculation_string).converted_calculation
    test(result_calculation_string, expected_converted_calculation, "Simulation.js functions not processed into square brackets")

    calculation_string = `A>B`
    expected_converted_calculation = `[A]>[B]`
    result_calculation_string = normalise_calculation_ids_and_extract_uuids(calculation_string).converted_calculation
    test(result_calculation_string, expected_converted_calculation, "Simulation.js equality signs not processed into square brackets")

    calculation_string = `[Some agent].FindAll([Some state]) + B`
    expected_converted_calculation = `[Some agent].FindAll([Some state]) + [B]`
    result_calculation_string = normalise_calculation_ids_and_extract_uuids(calculation_string).converted_calculation
    test(result_calculation_string, expected_converted_calculation, "Simulation.js agent functions not processed into square brackets")

    calculation_string = `[ Some variable ] + [ another variable ]`
    expected_converted_calculation = `[ Some variable ] + [ another variable ]`
    result_calculation_string = normalise_calculation_ids_and_extract_uuids(calculation_string).converted_calculation
    test(result_calculation_string, expected_converted_calculation, "Existing square bracket id with spaces is not altered")

    calculation_string = `{4 miles} / {6.4e3 meters}`
    expected_converted_calculation = `{4 miles} / {6.4e3 meters}`
    result_calculation_string = normalise_calculation_ids_and_extract_uuids(calculation_string).converted_calculation
    test(result_calculation_string, expected_converted_calculation, "Units inside curly braces are left unaltered")

}, false)
