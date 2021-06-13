import type { CreationContextState } from "../creation_context/state"
import { get_new_created_ats } from "../utils/datetime"
import { get_new_wcomponent_id } from "../utils/ids"
import type { WComponentJudgement } from "./interfaces/judgement"
import type { WComponentPrioritisation } from "./interfaces/priorities"
import type { WComponent, WComponentConnection, WComponentNode } from "./interfaces/SpecialisedObjects"
import type { WComponentNodeStateV2 } from "./interfaces/state"
import type { WComponentBase } from "./interfaces/wcomponent_base"



export function get_new_wcomponent_object (args: Partial<WComponent>, creation_context: CreationContextState)
{
    const base: WComponentBase = {
        id: get_new_wcomponent_id(),
        ...get_new_created_ats(creation_context),
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
            from_type: "state",
            to_type: "state",
            ...base,
            ...args,
            type: args.type, // only added to remove type warning
        }
        wcomponent = causal_link
    }
    else if (args.type === "judgement" || args.type === "objective")
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
    else if (args.type === "prioritisation")
    {
        const prioritisation: WComponentPrioritisation = {
            ...base,
            goals: {},
            explanation: "",
            datetime: { min: base.custom_created_at || base.created_at },
            ...args,
            type: args.type, // only added to remove type warning
        }
        wcomponent = prioritisation
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
