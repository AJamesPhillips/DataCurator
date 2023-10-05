import {
    WComponent,
    wcomponent_is_allowed_to_have_state_VAP_sets,
    wcomponent_is_statev2,
    wcomponent_is_action,
    WComponentsById,
    wcomponent_is_state_value,
} from "./interfaces/SpecialisedObjects"
import type { WComponentStateV2SubType } from "./interfaces/state"
import { VAPsType } from "./interfaces/VAPsType"



export function get_wcomponent_VAPs_represent (wcomponent: WComponent | undefined, wcomponents_by_id: WComponentsById, _wcomponent_ids_touched: Set<string> = new Set()): VAPsType
{
    let VAPs_represent = VAPsType.undefined

    do
    {
        if (_wcomponent_ids_touched.has(wcomponent?.id || ""))
        {
            console .log(`Recursion prevented in "get_wcomponent_VAPs_represent" for wcomponent id: "${wcomponent?.id}" type: "${wcomponent?.type}"`)
            break
        }
        if (wcomponent) _wcomponent_ids_touched.add(wcomponent.id)


        if (!wcomponent_is_allowed_to_have_state_VAP_sets(wcomponent)) break


        if (wcomponent_is_statev2(wcomponent)) VAPs_represent = subtype_to_VAPsType(wcomponent.subtype)
        else if (wcomponent_is_action(wcomponent)) VAPs_represent = VAPsType.action
        else if (wcomponent_is_state_value(wcomponent))
        {
            const attribute_wcomponent = wcomponents_by_id[wcomponent.attribute_wcomponent_id || ""]
            if (attribute_wcomponent) VAPs_represent = get_wcomponent_VAPs_represent(attribute_wcomponent, wcomponents_by_id, _wcomponent_ids_touched)
        }
        else
        {
            console.error(`Unimplemented "get_wcomponent_VAPs_represent" for wcomponent id: "${wcomponent.id}" type: "${wcomponent.type}"`)
        }

    } while (false)

    return VAPs_represent
}

function subtype_to_VAPsType (subtype: WComponentStateV2SubType | undefined): VAPsType
{
    return subtype === "boolean" ? VAPsType.boolean
    : (subtype === "number" ? VAPsType.number
        : (subtype === "other" ? VAPsType.other : VAPsType.undefined))
}
