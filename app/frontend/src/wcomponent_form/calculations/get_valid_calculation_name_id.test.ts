import { describe, test } from "../../shared/utils/test"
import { get_valid_calculation_name_id } from "./get_valid_calculation_name_id"



export const run_get_valid_calculation_name_id_tests = describe("get_valid_calculation_name_id", () =>
{
    let candidate_name_id: string | undefined
    let existing_calculation_name_ids: string[]
    let expected_valid_calculation_name_id: string
    let result_valid_calculation_name_id: string


    existing_calculation_name_ids = []
    candidate_name_id = undefined
    expected_valid_calculation_name_id = "A"
    result_valid_calculation_name_id = get_valid_calculation_name_id(existing_calculation_name_ids, candidate_name_id)
    test(result_valid_calculation_name_id, expected_valid_calculation_name_id, `Without any other IDs`)


    existing_calculation_name_ids = ["A"]
    candidate_name_id = undefined
    expected_valid_calculation_name_id = "B"
    result_valid_calculation_name_id = get_valid_calculation_name_id(existing_calculation_name_ids, candidate_name_id)
    test(result_valid_calculation_name_id, expected_valid_calculation_name_id, `With an existing ID of "A"`)


    existing_calculation_name_ids = [
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    ]
    candidate_name_id = undefined
    expected_valid_calculation_name_id = "AA"
    result_valid_calculation_name_id = get_valid_calculation_name_id(existing_calculation_name_ids, candidate_name_id)
    test(result_valid_calculation_name_id, expected_valid_calculation_name_id, `With existing IDs of "A" up to "Z"`)


    existing_calculation_name_ids = ["A", "B"]
    candidate_name_id = "a"
    expected_valid_calculation_name_id = "c"
    result_valid_calculation_name_id = get_valid_calculation_name_id(existing_calculation_name_ids, candidate_name_id)
    test(result_valid_calculation_name_id, expected_valid_calculation_name_id, `With existing IDs of "A" and "B", and given a  lower case "a"`)


    existing_calculation_name_ids = ["food"]
    candidate_name_id = "Food"
    expected_valid_calculation_name_id = "Fooe"
    result_valid_calculation_name_id = get_valid_calculation_name_id(existing_calculation_name_ids, candidate_name_id)
    test(result_valid_calculation_name_id, expected_valid_calculation_name_id, `With an existing ID of "food" and given "Food"`)

}, false)
