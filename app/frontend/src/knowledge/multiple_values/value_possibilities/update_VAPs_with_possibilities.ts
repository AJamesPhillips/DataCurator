import { test } from "../../../shared/utils/test"
import type { ValuePossibilitiesById } from "../../../shared/wcomponent/interfaces/possibility"
import type { StateValueAndPredictionsSet } from "../../../shared/wcomponent/interfaces/state"
import { prepare_new_VAP } from "../value_and_prediction/utils"



export function update_VAPs_with_possibilities (initial_values_and_prediction_sets: StateValueAndPredictionsSet[] | undefined, value_possibilities: ValuePossibilitiesById | undefined): StateValueAndPredictionsSet[] | undefined
{
    if (initial_values_and_prediction_sets === undefined) return undefined
    if (value_possibilities === undefined) return initial_values_and_prediction_sets

    return initial_values_and_prediction_sets.map(VAP_set =>
    {
        return {
            ...VAP_set,
            entries: VAP_set.entries.map(VAP =>
            {
                const value_id = VAP.value_id
                if (!value_id) return VAP
                const value_possibility = value_possibilities[value_id]
                if (!value_possibility) return VAP


                const value = value_possibility.value
                const description = value_possibility.description

                return {
                    ...VAP,
                    value,
                    description,
                }
            })
        }
    })
}



function run_tests ()
{
    const val_prob_id_123 = "val_prob_id_123"
    const value_possibilities: ValuePossibilitiesById = {
        [val_prob_id_123]: { id: val_prob_id_123, value: "value abc", description: "description abc", order: 0 },
    }
    const initial_values_and_prediction_sets: StateValueAndPredictionsSet[] = [
        {
            id: "VAPSet123",
            created_at: new Date(),
            base_id: 1,
            datetime: {},
            entries: [
                { ...prepare_new_VAP(), value_id: val_prob_id_123, value: "old abc value", description: "old abc description" },
            ],
        },
    ]

    let result = update_VAPs_with_possibilities(undefined, undefined)
    test(result, undefined, "Undefined initial VAPs returns undefined")

    result = update_VAPs_with_possibilities(undefined, value_possibilities)
    test(result, undefined, "Undefined initial VAPs returns undefined")

    result = update_VAPs_with_possibilities([], value_possibilities)
    test(result, [], "Empty initial VAPs returns empty")

    result = update_VAPs_with_possibilities(initial_values_and_prediction_sets, undefined)
    test(result, initial_values_and_prediction_sets, "Undefined value_possibilities returns initial VAPs")

    console .log("Updates VAPs in VAP Set with value_possibilities ...")
    result = update_VAPs_with_possibilities(initial_values_and_prediction_sets, value_possibilities)
    test(Array.isArray(result), true, "Returns an array")
    if (result)
    {
        test(result[0]?.entries[0]?.value, value_possibilities[val_prob_id_123]?.value, "Updates value")
        test(result[0]?.entries[0]?.description, value_possibilities[val_prob_id_123]?.description, "Updates description")
    }

}

run_tests()
