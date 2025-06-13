
import { get_new_id } from "datacurator-core/utils/ids"

import type { HasBaseId } from "../../shared/interfaces/base"
import type { WComponentNodeAction } from "../interfaces/action"
import { WComponent, WComponentConnection, WComponentNode, wcomponent_is_causal_link } from "../interfaces/SpecialisedObjects"
import type { WComponentNodeStateV2 } from "../interfaces/state"
import type { WComponentBase } from "../interfaces/wcomponent_base"



export function prepare_new_contextless_wcomponent_object (partial_wcomponent: Partial<WComponent> & HasBaseId)
{
    const base: WComponentBase = {
        id: get_new_id(),
        created_at: new Date(),
        base_id: partial_wcomponent.base_id,
        title: "",
        description: "",
        type: "process",
    }

    let wcomponent: WComponent

    if (partial_wcomponent.type === "causal_link" || partial_wcomponent.type === "relation_link")
    {
        let link: WComponentConnection = {
            ...base,
            from_id: "",
            to_id: "",
            from_type: "state",
            to_type: "state",
            ...partial_wcomponent,
            type: partial_wcomponent.type, // only added to remove type warning
        }

        if (wcomponent_is_causal_link(link))
        {
            link = {
                effect_string: "1",
                effect_when_true: 1,
                effect_when_false: undefined,
                values_and_prediction_sets: [],
                ...link,
            }
        }

        wcomponent = link
    }
    else if (partial_wcomponent.type === "statev2")
    {
        const statev2: WComponentNodeStateV2 = {
            ...base,
            subtype: undefined, // "boolean", -- most things are not boolean
            values_and_prediction_sets: [],
            ...partial_wcomponent,
            type: partial_wcomponent.type, // only added to remove type warning
        }
        wcomponent = statev2
    }
    else if (partial_wcomponent.type === "action")
    {
        const action: WComponentNodeAction = {
            ...base,
            values_and_prediction_sets: [],
            reason_for_status: "",
            depends_on_action_ids: [],
            ...partial_wcomponent,
            type: partial_wcomponent.type, // only added to remove type warning
        }
        wcomponent = action
    }
    else
    {
        const node: WComponentNode = {
            // encompassed_by: "",
            ...base,
            ...partial_wcomponent,
            type: partial_wcomponent.type || "process", // only added to remove type warning
        }
        wcomponent = node
    }

    return wcomponent
}


/**
 * @deprecated can be replaced with prepare_new_contextless_wcomponent_object now that we have
 * removed the creation context
 */
export function prepare_new_wcomponent_object (partial_wcomponent: Partial<WComponent> & HasBaseId)
{
    return prepare_new_contextless_wcomponent_object(partial_wcomponent)
}
