import {
    WComponent,
    wcomponent_should_have_state_VAP_sets,
    wcomponent_is_statev2,
    wcomponent_is_action,
    wcomponent_is_causal_link,
} from "./interfaces/SpecialisedObjects"
import type { WComponentStateV2SubType } from "./interfaces/state"
import { VAPsType } from "./interfaces/value_probabilities_etc"



export function get_wcomponent_VAPs_represent (wcomponent: WComponent | undefined)
{
    let VAPs_represent = VAPsType.undefined

    if (wcomponent_should_have_state_VAP_sets(wcomponent))
    {
        VAPs_represent = VAPsType.other
        if (wcomponent_is_statev2(wcomponent)) VAPs_represent = subtype_to_VAPsType(wcomponent.subtype)
        else if (wcomponent_is_action(wcomponent)) VAPs_represent = VAPsType.action
        else if (wcomponent_is_causal_link(wcomponent))
        {
            // does this make sense? When is the VAPsType of a causal link used?
            VAPs_represent = VAPsType.boolean
        }
        else
        {
            console.error(`Unimplmented "get_wcomponent_VAPs_represent" for wcomponent id: "${wcomponent.id}" type: "${wcomponent.type}"`)
        }
    }

    return VAPs_represent
}

function subtype_to_VAPsType (subtype: WComponentStateV2SubType): VAPsType
{
    return subtype === "boolean" ? VAPsType.boolean
    : (subtype === "number" ? VAPsType.number
        : (subtype === "other" ? VAPsType.other : VAPsType.undefined))
}
