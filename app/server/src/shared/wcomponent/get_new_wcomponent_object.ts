import type { CreationContextState } from "../creation_context/state"
import { get_new_created_ats } from "../utils/datetime"
import { date2str_auto } from "../utils/date_helpers"
import { get_new_wcomponent_id } from "../utils/ids"
import type { WComponentNodeGoal } from "./interfaces/goal"
import type { WComponentJudgement } from "./interfaces/judgement"
import type { WComponentPrioritisation } from "./interfaces/priorities"
import type { WComponent, WComponentConnection, WComponentNode } from "./interfaces/SpecialisedObjects"
import type { WComponentNodeStateV2 } from "./interfaces/state"
import type { WComponentBase } from "./interfaces/wcomponent_base"



export function get_contextless_new_wcomponent_object (partial_wcomponent: Partial<WComponent>)
{
    const base: WComponentBase = {
        id: get_new_wcomponent_id(),
        created_at: new Date(),
        title: "",
        description: "",
        type: "process",
    }

    let wcomponent: WComponent

    if (partial_wcomponent.type === "causal_link" || partial_wcomponent.type === "relation_link")
    {
        const causal_link: WComponentConnection = {
            from_id: "",
            to_id: "",
            from_type: "state",
            to_type: "state",
            ...base,
            ...partial_wcomponent,
            type: partial_wcomponent.type, // only added to remove type warning
        }
        wcomponent = causal_link
    }
    else if (partial_wcomponent.type === "judgement" || partial_wcomponent.type === "objective")
    {
        const judgement: WComponentJudgement = {
            judgement_target_wcomponent_id: "",
            judgement_operator: "!=",
            judgement_comparator_value: "",
            judgement_manual: undefined,
            ...base,
            ...partial_wcomponent,
            type: partial_wcomponent.type, // only added to remove type warning
        }
        wcomponent = judgement
    }
    else if (partial_wcomponent.type === "statev2")
    {
        const statev2: WComponentNodeStateV2 = {
            ...base,
            subtype: "boolean",
            values_and_prediction_sets: [],
            ...partial_wcomponent,
            type: partial_wcomponent.type, // only added to remove type warning
        }
        wcomponent = statev2
    }
    else if (partial_wcomponent.type === "prioritisation")
    {
        const when = base.custom_created_at || base.created_at

        const prioritisation: WComponentPrioritisation = {
            ...base,
            title: date2str_auto({ date: when, time_resolution: "day" }),
            goals: {},
            datetime: { min: when },
            ...partial_wcomponent,
            type: partial_wcomponent.type, // only added to remove type warning
        }
        wcomponent = prioritisation
    }
    else if (partial_wcomponent.type === "goal")
    {
        const when = base.custom_created_at || base.created_at

        const goal: WComponentNodeGoal = {
            ...base,
            ...partial_wcomponent,
            objective_ids: [],
            type: partial_wcomponent.type, // only added to remove type warning
        }
        wcomponent = goal
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



export function get_new_wcomponent_object (partial_wcomponent: Partial<WComponent>, creation_context: CreationContextState)
{
    const wcomponent: WComponent = {
        ...get_contextless_new_wcomponent_object(partial_wcomponent),
        ...get_new_created_ats(creation_context),
    }

    return wcomponent
}
