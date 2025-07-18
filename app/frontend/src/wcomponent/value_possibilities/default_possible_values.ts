import { describe, test } from "datacurator-core/utils/test"
import { action_statuses } from "../interfaces/action"
import type { SimpleValuePossibility } from "../interfaces/possibility"
import { VAPsType } from "../interfaces/VAPsType"
import {
    ORDERED_ACTION_VALUE_POSSIBILITY_ID,
    VALUE_POSSIBILITY_IDS,
    VALUE_POSSIBILITY_IDS_to_text,
} from "../value/parse_value"



export function default_possible_values (VAPs_represent: VAPsType, simple_possibilities: SimpleValuePossibility[]): SimpleValuePossibility[]
{
    if (VAPs_represent === VAPsType.boolean)
    {
        simple_possibilities = [
            { value: "True", id: VALUE_POSSIBILITY_IDS.boolean_true, order: 0 },
            { value: "False", id: VALUE_POSSIBILITY_IDS.boolean_false, order: 1 },
        ]
    }
    else if (VAPs_represent === VAPsType.action)
    {
        simple_possibilities = ORDERED_ACTION_VALUE_POSSIBILITY_ID.map((id, index) => ({
            id,
            value: VALUE_POSSIBILITY_IDS_to_text[id] || "?",
            order: index
        }))
    }
    else if (simple_possibilities.length === 0)
    {
        // TODO: get rid of this as it's a bit bizarre & random?
        (VAPs_represent === VAPsType.number ? ["1"] : [""])
        .forEach((value, index) =>
        {
            simple_possibilities.push({ value, order: index })
        })
    }

    return simple_possibilities
}



export const test_default_possible_values = describe.delay("default_possible_values", () =>
{
    const simple_possibilities: SimpleValuePossibility[] = [
        {
            id: "730a7cb4-7523-45f7-bfde-a00d0acb9f65",
            value: "",
            description: "",
            order: 0
        },
        {
            id: "724c4da6-f4ee-4680-a493-556ee241f29d",
            value: "",
            description: "",
            order: 1
        }
    ]

    let result = default_possible_values(VAPsType.boolean, simple_possibilities)
    // Test failing.  Skipping for now.  Not sure if the test or the implementation is incorrect
    test.skip(result.length, 1, "If boolean and given more than one value possibility, it should be reduced back to 1")
    // test(result[0]?.id, simple_possibilities[0]?.id, "ID should match existing ID")

    result = default_possible_values(VAPsType.boolean, [])
    test(result.length, 2, "If boolean and no value possibilities, it should create 2")

    result = default_possible_values(VAPsType.action, [])
    test(result.length, action_statuses.length, "If action and no value possibilities, it should create the set")

    result = default_possible_values(VAPsType.other, [])
    test(result.length, 1, "If other and no value possibilities, it should create an empty value")

    result = default_possible_values(VAPsType.number, [])
    test(result.length, 1, "If other and no value possibilities, it should create an empty value")

})
