import { test } from "../../shared/utils/test"
import { action_statuses } from "../interfaces/action"
import { VAPsType } from "../interfaces/VAPsType"
import type { SimpleValuePossibility } from "../interfaces/possibility"
import { value_possibility_visual_true_id, value_possibility_visual_false_id } from "../value/parse_value"



export function default_possible_values (VAPs_represent: VAPsType, simple_possibilities: SimpleValuePossibility[]): SimpleValuePossibility[]
{
    if (VAPs_represent === VAPsType.boolean)
    {
        simple_possibilities = [
            { value: "True", id: value_possibility_visual_true_id, order: 0 },
            { value: "False", id: value_possibility_visual_false_id, order: 1 },
        ]
    }
    else if (simple_possibilities.length === 0)
    {
        (VAPs_represent === VAPsType.action ? action_statuses
            : VAPs_represent === VAPsType.number ? ["1"] : [""])
            .forEach((value, index) =>
            {
                simple_possibilities.push({ value: value, order: index })
            })
    }

    return simple_possibilities
}



function run_tests ()
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
    test(result.length, 1, "If boolean and given more than one value possibility, it should be reduced back to 1")
    // test(result[0]?.id, simple_possibilities[0]?.id, "ID should match existing ID")

    result = default_possible_values(VAPsType.boolean, [])
    test(result.length, 2, "If boolean and no value possibilities, it should create 2")

    result = default_possible_values(VAPsType.action, [])
    test(result.length, action_statuses.length, "If action and no value possibilities, it should create the set")

    result = default_possible_values(VAPsType.other, [])
    test(result.length, 1, "If other and no value possibilities, it should create an empty value")

    result = default_possible_values(VAPsType.number, [])
    test(result.length, 1, "If other and no value possibilities, it should create an empty value")

}

// run_tests()
