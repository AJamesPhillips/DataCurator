import type { SimpleValuePossibility } from "../../../wcomponent/interfaces/possibility"
import type {
    StateValueAndPredictionsSet as VAPSet,
    WComponentNodeStateV2,
} from "../../../wcomponent/interfaces/state"
import type { WComponentSubState } from "../../../wcomponent/interfaces/substate"
import { get_wcomponent_VAPs_represent } from "../../../wcomponent/value_and_prediction/utils"
import { get_simple_possibilities_from_VAP_sets } from "../value_possibilities/get_possibilities_from_VAP_sets"



export interface SimpleValuePossibilityWithSelected extends SimpleValuePossibility
{
    selected: boolean | undefined
}


export function get_sub_state_value_possibilities (wcomponent: WComponentSubState, target_wcomponent: WComponentNodeStateV2): SimpleValuePossibilityWithSelected[]
{
    const { selector } = wcomponent
    const { target_VAP_set_id, target_value_id_type, target_value } = selector || {}

    if (wcomponent.target_wcomponent_id !== target_wcomponent.id)
    {
        console.error(`Inconsistent sub_state wcomponent.target_wcomponent_id: "${wcomponent.target_wcomponent_id}" and statev2 target_wcomponent.id: "${target_wcomponent.id}"`)
    }

    const VAPs_represent = get_wcomponent_VAPs_represent(target_wcomponent)
    const target_VAP_sets: VAPSet[] = target_wcomponent.values_and_prediction_sets || []
    const simple_possibilities = get_simple_possibilities_from_VAP_sets(VAPs_represent, target_wcomponent.value_possibilities, target_VAP_sets)

    return simple_possibilities.map(possilibity =>
    {
        const selected = target_value_id_type === undefined ? undefined
            : target_value_id_type === "value_string" ? possilibity.value === target_value
            : possilibity.id === target_value

        return { ...possilibity, selected }
    })
}
