import { percentage_to_string } from "../form/EditablePercentage"
import type { StateValueAndPredictionsSet, WComponentStateV2SubType } from "../shared/wcomponent/interfaces/state"
import { get_VAPs_ordered_by_prob } from "../shared/wcomponent/value_and_prediction/utils"



export function get_probable_VAP_set_values (VAP_set: StateValueAndPredictionsSet, subtype: WComponentStateV2SubType)
{
    const VAPs_represents_boolean = subtype === "boolean"

    const VAPs = get_VAPs_ordered_by_prob(VAP_set.entries, VAPs_represents_boolean)
    const first_VAP = VAPs[0]
    if (VAPs_represents_boolean && first_VAP) return first_VAP.probability > 0.5 ? "True" : "False"

    return VAPs.map(e => e.value).join(", ") || "-"
}


export function get_VAP_set_prob (VAP_set: StateValueAndPredictionsSet, subtype: WComponentStateV2SubType)
{
    const VAPs_represents_boolean = subtype === "boolean"

    const VAPs = get_VAPs_ordered_by_prob(VAP_set.entries, VAPs_represents_boolean)
    const first_VAP = VAPs[0]
    if (VAPs_represents_boolean && first_VAP) return percentage_to_string(first_VAP.probability)

    return VAPs.map(e => percentage_to_string(e.probability)).join(", ")
}


export function get_VAP_set_conviction (VAP_set: StateValueAndPredictionsSet, subtype: WComponentStateV2SubType)
{
    const VAPs_represents_boolean = subtype === "boolean"

    const VAPs = get_VAPs_ordered_by_prob(VAP_set.entries, VAPs_represents_boolean)
    const first_VAP = VAPs[0]
    if (VAPs_represents_boolean && first_VAP) return percentage_to_string(first_VAP.conviction)

    return VAPs.map(e => percentage_to_string(e.conviction)).join(", ")
}
