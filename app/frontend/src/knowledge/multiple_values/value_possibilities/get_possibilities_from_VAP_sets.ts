import type {
    StateValueAndPredictionsSet,
    StateValueAndPredictionsSet as VAPSet,
} from "../../../shared/wcomponent/interfaces/state"
import { VAPsType } from "../../../shared/wcomponent/interfaces/generic_value"
import type {
    SimpleValuePossibility,
    ValuePossibilitiesById,
    ValuePossibility,
} from "../../../shared/wcomponent/interfaces/possibility"
import { default_possible_values } from "./default_possible_values"
import { prepare_new_VAP } from "../value_and_prediction/utils"
import { test } from "../../../shared/utils/test"



export function get_possibilities_from_VAP_sets (VAPs_represent: VAPsType, value_possibilities: ValuePossibilitiesById | undefined, VAP_sets: VAPSet[]): ValuePossibility[]
{
    const simple_possibilities: SimpleValuePossibility[] = []
    const possible_value_strings: Set<string> = new Set()


    VAP_sets.forEach(VAP_set =>
    {
        VAP_set.entries.forEach(({ value_id }) =>
        {
            const value_possibility = value_possibilities && value_possibilities[value_id || ""]
            if (!value_possibility || possible_value_strings.has(value_possibility.value)) return

            simple_possibilities.push(value_possibility)
            // Use the source of truth for the value not the denormalised `value` on the VAP
            possible_value_strings.add(value_possibility.value)
        })
    })


    VAP_sets.forEach(VAP_set =>
    {
        VAP_set.entries.forEach(({ value }) =>
        {
            if (possible_value_strings.has(value)) return
            simple_possibilities.push({ value })
            possible_value_strings.add(value)
        })
    })


    const possibilities: ValuePossibility[] = default_possible_values(VAPs_represent, simple_possibilities)

    return possibilities
}



function run_tests ()
{
    const VAPs_represent = VAPsType.number
    const val_prob_id_123 = "val_prob_id_123"
    const VAP_sets: StateValueAndPredictionsSet[] = [
        {
            id: "VAPSet123",
            created_at: new Date(),
            base_id: 1,
            datetime: {},
            entries: [
                { ...prepare_new_VAP(), value_id: val_prob_id_123, value: "abc", description: "" },
                { ...prepare_new_VAP(), value_id: undefined, value: "duplicated", description: "" },
                { ...prepare_new_VAP(), value_id: undefined, value: "duplicated", description: "" },
            ],
        },
    ]


    let result = get_possibilities_from_VAP_sets(VAPs_represent, undefined, VAP_sets)
    test(result.length, 2, "Should get possibilities for all unique values")
    test(result[0]?.value, "abc")
    test(result[0]?.id !== val_prob_id_123, true, "Should set a new ID")
    test(result[1]?.value, "duplicated")

    let value_possibilities: ValuePossibilitiesById = {
        [val_prob_id_123]: {id: val_prob_id_123, value: "new abc", description: "", order: 1}
    }
    result = get_possibilities_from_VAP_sets(VAPs_represent, value_possibilities, VAP_sets)
    test(result[0]?.value, "new abc")
    test(result[0]?.id, val_prob_id_123, "Should reuse existing ID")
    test(result[1]?.order, 2, "Should increment off maximum order")
}

// run_tests()
