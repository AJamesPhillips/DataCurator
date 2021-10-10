import type { VAP_set_id_counterfactual_mapV2 } from "../uncertainty/uncertainty"
import { CurrentValueAndProbabilities, VAPsType } from "./interfaces/generic_value"
import {
    WComponent,
    wcomponent_is_action,
    wcomponent_is_statev2,
    wcomponent_should_have_state_VAP_sets,
} from "./interfaces/SpecialisedObjects"
import { get_current_values_and_probabilities } from "./value_and_prediction/get_value"
import { subtype_to_VAPsType } from "./value_and_prediction/utils"



export function get_wcomponent_VAPsType (wcomponent: WComponent)
{
    if (wcomponent_should_have_state_VAP_sets(wcomponent)) return VAPsType.undefined

    let VAPs_represent = VAPsType.other

    if (wcomponent_is_statev2(wcomponent)) VAPs_represent = subtype_to_VAPsType(wcomponent.subtype)
    else if (wcomponent_is_action(wcomponent)) VAPs_represent = VAPsType.action
    else
    {
        console.error(`Unimplmented "get_wcomponent_VAPsType" for wcomponent id: "${wcomponent.id}" type: "${wcomponent.type}"`)
    }

    return VAPs_represent
}


interface GetWcomponentStateValueArgs
{
    wcomponent: WComponent
    wc_counterfactuals: VAP_set_id_counterfactual_mapV2 | undefined
    created_at_ms: number
    sim_ms: number
}
export function get_wcomponent_state_value (args: GetWcomponentStateValueArgs): CurrentValueAndProbabilities[]
{
    const { wcomponent, wc_counterfactuals, created_at_ms, sim_ms } = args


    if (wcomponent_should_have_state_VAP_sets(wcomponent))
    {
        const VAPs_represent = get_wcomponent_VAPsType(wcomponent)

        return get_current_values_and_probabilities({
            values_and_prediction_sets: wcomponent.values_and_prediction_sets,
            VAPs_represent,
            wc_counterfactuals,
            created_at_ms,
            sim_ms,
        })
    }
    else return []
}
