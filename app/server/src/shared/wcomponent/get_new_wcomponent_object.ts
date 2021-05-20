import { floor_datetime } from "../utils/datetime"
import { get_new_wcomponent_id } from "../utils/ids"
import type { WComponentJudgement } from "./interfaces/judgement"
import type { WComponent, WComponentConnection, WComponentNode } from "./interfaces/SpecialisedObjects"
import type { WComponentNodeStateV2 } from "./interfaces/state"
import type { WComponentBase } from "./interfaces/wcomponent"



export function get_new_wcomponent_object (args: Partial<WComponent>)
{
    const created_at = new Date()
    const base: WComponentBase = {
        id: get_new_wcomponent_id(),
        created_at,
        custom_created_at: floor_datetime(created_at, "hour"),
        title: "",
        description: "",
        type: "process",
    }

    let wcomponent: WComponent

    if (args.type === "causal_link" || args.type === "relation_link")
    {
        const causal_link: WComponentConnection = {
            from_id: "",
            to_id: "",
            from_type: "value",
            to_type: "value",
            ...base,
            ...args,
            type: args.type, // only added to remove type warning
        }
        wcomponent = causal_link
    }
    else if (args.type === "judgement")
    {
        const judgement: WComponentJudgement = {
            judgement_target_wcomponent_id: "",
            judgement_operator: "!=",
            judgement_comparator_value: "",
            judgement_manual: undefined,
            ...base,
            ...args,
            type: args.type, // only added to remove type warning
        }
        wcomponent = judgement
    }
    else if (args.type === "statev2")
    {
        const statev2: WComponentNodeStateV2 = {
            ...base,
            subtype: "boolean",
            values_and_prediction_sets: [],
            ...args,
            type: args.type, // only added to remove type warning
        }
        wcomponent = statev2
    }
    else
    {
        const node: WComponentNode = {
            // encompassed_by: "",
            ...base,
            ...args,
            type: args.type || "process", // only added to remove type warning
        }
        wcomponent = node
    }

    return wcomponent
}