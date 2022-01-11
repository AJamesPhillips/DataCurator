import { ratio_to_percentage_string } from "../../sharedf/percentages"
import { VAPsType } from "../../wcomponent/interfaces/VAPsType"
import type { StateValueAndPredictionsSet } from "../../wcomponent/interfaces/state"
import { get_VAPs_ordered_by_prob } from "./probable_VAPs"



export function get_probable_VAP_set_values_for_display (VAP_set: StateValueAndPredictionsSet, VAPs_represent: VAPsType)
{
    const VAPs = get_VAPs_ordered_by_prob(VAP_set.entries, VAPs_represent)
    const first_VAP = VAPs[0]
    if (VAPs_represent === VAPsType.boolean && first_VAP) return first_VAP.probability > 0.5 ? "True" : "False"

    const probable_VAPS = VAPs.filter(({ probability }) => probability > 0)

    return probable_VAPS.map(e => e.value).join(", ") || "-"
}



export function get_VAP_set_probable_percentages_for_display (VAP_set: StateValueAndPredictionsSet, VAPs_represent: VAPsType)
{
    const VAPs = get_VAPs_ordered_by_prob(VAP_set.entries, VAPs_represent)
    const first_VAP = VAPs[0]
    if (VAPs_represent === VAPsType.boolean && first_VAP) return ratio_to_percentage_string(first_VAP.probability)

    const probable_VAPS = VAPs.filter(({ probability }) => probability > 0)

    return probable_VAPS.map(e => ratio_to_percentage_string(e.probability)).join(", ")
}



export function get_VAP_set_conviction (VAP_set: StateValueAndPredictionsSet, VAPs_represent: VAPsType)
{
    const VAPs = get_VAPs_ordered_by_prob(VAP_set.entries, VAPs_represent)
    const first_VAP = VAPs[0]
    if (VAPs_represent === VAPsType.boolean && first_VAP) return ratio_to_percentage_string(first_VAP.conviction)

    const probable_VAPS = VAPs.filter(({ probability }) => probability > 0)

    const convictions = new Set<number>()
    probable_VAPS.forEach(({ conviction }) => convictions.add(conviction))
    const same_convictions = convictions.size <= 1

    return probable_VAPS.slice(0, same_convictions ? 1 : undefined)
        .map(e => ratio_to_percentage_string(e.conviction)).join(", ")
}
