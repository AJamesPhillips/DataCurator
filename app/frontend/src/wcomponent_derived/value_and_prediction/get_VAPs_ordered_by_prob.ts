import type { StateValueAndPrediction } from "../../wcomponent/interfaces/state"
import { VAPsType } from "../../wcomponent/interfaces/VAPsType"



export function get_VAPs_ordered_by_prob <E extends StateValueAndPrediction> (VAPs: E[], VAPs_represent: VAPsType): E[]
{
    const first_VAP = VAPs[0]
    if (VAPs_represent === VAPsType.boolean && first_VAP) return [first_VAP]

    return VAPs.sort((a, b) => a.probability > b.probability ? -1 : (a.probability < b.probability ? 1 : 0))
}
