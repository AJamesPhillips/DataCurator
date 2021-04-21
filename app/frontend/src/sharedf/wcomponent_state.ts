import { percentage_to_string } from "../form/EditablePercentage"
import { get_vaps_ordered_by_prob } from "../shared/models/get_wcomponent_state_value"
import type { StateValueAndPredictionsSet, WComponentStateV2SubType } from "../shared/models/interfaces/state"



export function get_probable_vap_set_values (vap_set: StateValueAndPredictionsSet, subtype: WComponentStateV2SubType)
{
    const vaps = get_vaps_ordered_by_prob(vap_set, subtype)
    if (subtype === "boolean") return vaps[0].probability > 0.5 ? "True" : "False"

    return vaps.map(e => e.value).join(", ") || "-"
}


export function get_vap_set_prob (vap_set: StateValueAndPredictionsSet, subtype: WComponentStateV2SubType)
{
    const vaps = get_vaps_ordered_by_prob(vap_set, subtype)
    if (subtype === "boolean") return percentage_to_string(vaps[0].probability)

    return vaps.map(e => percentage_to_string(e.probability)).join(", ")
}


export function get_vap_set_conviction (vap_set: StateValueAndPredictionsSet, subtype: WComponentStateV2SubType)
{
    const vaps = get_vaps_ordered_by_prob(vap_set, subtype)
    if (subtype === "boolean") return percentage_to_string(vaps[0].conviction)

    return vaps.map(e => percentage_to_string(e.conviction)).join(", ")
}
