import { WComponent, wcomponent_is_statev2 } from "../../wcomponent/interfaces/SpecialisedObjects"
import {
    value_possibility_visual_true_id,
    value_possibility_visual_false_id,
} from "../../wcomponent/value/parse_value"
import type { ParsedValue } from "../interfaces/value"




interface BooleanRepresentation
{
    true: string
    false: string
}
export function get_boolean_representation (wcomponent: WComponent | undefined, append_boolean_explanation?: boolean): BooleanRepresentation
{
    let boolean_true_str = ""
    let boolean_false_str = ""


    if (wcomponent_is_statev2(wcomponent))
    {
        const { value_possibilities = {} } = wcomponent
        const value_true = value_possibilities[value_possibility_visual_true_id]
        const value_false = value_possibilities[value_possibility_visual_false_id]
        // if ()

        boolean_true_str = value_true?.value || boolean_true_str
        boolean_false_str = value_false?.value || boolean_false_str
    }


    boolean_true_str = boolean_true_str ? (append_boolean_explanation ? boolean_true_str + " (True)" : boolean_true_str) : "True"
    boolean_false_str = boolean_false_str ? (append_boolean_explanation ? boolean_false_str + " (False)" : boolean_false_str) : "False"


    return { true: boolean_true_str, false: boolean_false_str }
}



export function parsed_value_to_string (value: ParsedValue, boolean_representation: BooleanRepresentation)
{
    let value_string: string

    if (typeof value === "boolean")
    {
        value_string = value ? boolean_representation.true : boolean_representation.false
    }
    else value_string = `${value}`

    return value_string
}
