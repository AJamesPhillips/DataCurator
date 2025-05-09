import { get_wcomponent_VAPs_represent } from "../../wcomponent/get_wcomponent_VAPs_represent"
import type { SimpleValuePossibility } from "../../wcomponent/interfaces/possibility"
import type { WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import type {
    HasVAPSetsAndMaybeValuePossibilities,
    StateValueCore,
    StateValueAndPredictionsSet as VAPSet,
} from "../../wcomponent/interfaces/state"
import type { WComponentSubStateSelector } from "../../wcomponent/interfaces/substate"
import {
    get_simple_possibilities_from_values,
} from "../../wcomponent/value_possibilities/get_possibilities_from_VAP_sets"
import { convert_VAP_set_to_VAP_visuals } from "../value_and_prediction/convert_VAP_set_to_VAP_visuals"



export interface SimpleValuePossibilityWithSelected extends SimpleValuePossibility
{
    selected: boolean | undefined
}



interface Args
{
    selector: WComponentSubStateSelector | undefined
    target_wcomponent: WComponent & HasVAPSetsAndMaybeValuePossibilities
}

// Related to but different from convert_VAP_set_to_VAP_visuals
export function convert_VAP_sets_to_visual_sub_state_value_possibilities (args: Args): SimpleValuePossibilityWithSelected[]
{
    const { selector, target_wcomponent } = args
    const { target_VAP_set_id, target_value_id_type, target_value } = selector || {}

    const target_VAP_sets = get_substate_target_VAP_sets(target_wcomponent, target_VAP_set_id)

    // todo should implement this fully?
    const wcomponents_by_id = {}
    const VAPs_represent = get_wcomponent_VAPs_represent(target_wcomponent, wcomponents_by_id)
    const values: StateValueCore[] = []
    target_VAP_sets.forEach(VAP_set =>
    {
        convert_VAP_set_to_VAP_visuals({ VAP_set, VAPs_represent, wcomponent: target_wcomponent })
        .forEach(({ value_id, value_text }) => values.push({ value_id, value: value_text }))
    })

    const simple_possibilities = get_simple_possibilities_from_values(values, target_wcomponent.value_possibilities)

    return simple_possibilities.map(possilibity =>
    {
        const selected = predicate_target_value_possibility({
            target_value_id_type,
            target_value,
            value_text: possilibity.value,
            value_id: possilibity.id,
        })

        return { ...possilibity, selected }
    })
}



function get_substate_target_VAP_sets (target_wcomponent: WComponent & HasVAPSetsAndMaybeValuePossibilities, target_VAP_set_id?: string): VAPSet[]
{
    let target_VAP_sets: VAPSet[] = target_wcomponent.values_and_prediction_sets || []
    if (target_VAP_set_id) target_VAP_sets = target_VAP_sets.filter(({ id }) => id === target_VAP_set_id)

    return target_VAP_sets
}



interface PredicateTargetValuePossibilityArgs
{
    target_value_id_type?: "id" | "value_string"
    target_value?: string
    value_text?: string
    value_id?: string
}
export function predicate_target_value_possibility (args: PredicateTargetValuePossibilityArgs)
{
    const {
        target_value_id_type, target_value,
        value_text, value_id,
    } = args

    let selected = undefined
    if (target_value_id_type === "value_string") selected = target_value === value_text
    else if (target_value_id_type === "id")      selected = target_value === value_id

    return selected
}
