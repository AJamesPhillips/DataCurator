import type { CreationContextState } from "../../../shared/creation_context/state"
import { get_new_created_ats } from "../../../shared/utils/datetime"
import { get_new_value_and_prediction_set_id } from "../../../shared/utils/ids"
import { test } from "../../../shared/utils/test"
import { VAPsType } from "../../../shared/wcomponent/interfaces/generic_value"
import type { ValuePossibilitiesById } from "../../../shared/wcomponent/interfaces/possibility"
import type { StateValueAndPredictionsSet as VAPSet } from "../../../shared/wcomponent/interfaces/state"
import { prepare_new_VAP, prepare_new_VAP_set_entries } from "./utils"



export function prepare_new_VAP_set (VAPs_represent: VAPsType, value_possibilities: ValuePossibilitiesById | undefined, existing_VAP_sets: VAPSet[], base_id: number, creation_context: CreationContextState): VAPSet
{
    const dates = get_new_created_ats(creation_context)
    // const now = new Date(get_created_at_ms(dates))

    const entries_with_probabilities = prepare_new_VAP_set_entries(VAPs_represent, value_possibilities, existing_VAP_sets)


    const new_VAP_set = {
        id: get_new_value_and_prediction_set_id(),
        ...dates,
        base_id,
        datetime: {}, // min: now },
        entries: entries_with_probabilities,
    }

    return new_VAP_set
}



function run_tests ()
{

    const VAP_sets: VAPSet[] = [
        { ...prepare_new_VAP_set(VAPsType.other, undefined, [], 1, {}), entries: [
            { ...prepare_new_VAP(), value_id: "1", value: "a" },
            { ...prepare_new_VAP(), value_id: "2", value: "b" },
        ] },
        { ...prepare_new_VAP_set(VAPsType.other, undefined, [], 1, {}), entries: [
            { ...prepare_new_VAP(), value_id: "1", value: "a" },
            { ...prepare_new_VAP(), value_id: "2", value: "b" },
        ] }
    ]

    const value_possibilities: ValuePossibilitiesById = {
        "1": { id: "1", value: "a", description: "", order: 0 },
        "2": { id: "2", value: "b", description: "", order: 1 },
    }

    let result = prepare_new_VAP_set(VAPsType.other, value_possibilities, VAP_sets, 1, {})

    test(result.entries.length, 2, "If there are only two unique possibilities, only return 2 VAPs")
}

// run_tests()
