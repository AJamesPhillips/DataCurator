import type { CreationContextState } from "../../state/creation_context/state"
import type { HasBaseId } from "../../shared/interfaces/base"
import { get_new_created_ats } from "../../shared/utils/datetime"
import { date2str_auto } from "../../shared/utils/date_helpers"
import { get_new_wcomponent_id } from "../../shared/utils/ids"
import type { WComponentNodeAction } from "../interfaces/action"
import type { WComponentNodeGoal } from "../interfaces/goal"
import type { WComponentJudgement } from "../interfaces/judgement"
import type { WComponentPrioritisation } from "../interfaces/priorities"
import { WComponent, WComponentConnection, WComponentNode, wcomponent_is_causal_link } from "../interfaces/SpecialisedObjects"
import type { WComponentNodeStateV2 } from "../interfaces/state"
import type { WComponentBase } from "../interfaces/wcomponent_base"



export function prepare_new_contextless_wcomponent_object (partial_wcomponent: Partial<WComponent> & HasBaseId)
{
    const base: WComponentBase = {
        id: get_new_wcomponent_id(),
        created_at: new Date(),
        base_id: partial_wcomponent.base_id,
        title: "",
        description: "",
        type: "process",
    }

    const when = (partial_wcomponent.custom_created_at
        || partial_wcomponent.created_at
        || base.custom_created_at
        || base.created_at)

    let wcomponent: WComponent

    if (partial_wcomponent.type === "causal_link" || partial_wcomponent.type === "relation_link")
    {
        let link: WComponentConnection = {
            from_id: "",
            to_id: "",
            from_type: "state",
            to_type: "state",
            ...base,
            ...partial_wcomponent,
            type: partial_wcomponent.type, // only added to remove type warning
        }

        if (wcomponent_is_causal_link(link))
        {
            link = {
                effect_when_true: 1,
                effect_when_false: -1,
                values_and_prediction_sets: [],
                ...link,
            }
        }

        wcomponent = link
    }
    else if (partial_wcomponent.type === "judgement" || partial_wcomponent.type === "objective")
    {
        const judgement: WComponentJudgement = {
            judgement_target_wcomponent_id: "",
            judgement_operator: "==",
            judgement_comparator_value: "True",
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
            subtype: undefined, // "boolean", -- most things are not boolean
            values_and_prediction_sets: [],
            ...partial_wcomponent,
            type: partial_wcomponent.type, // only added to remove type warning
        }
        wcomponent = statev2
    }
    else if (partial_wcomponent.type === "prioritisation")
    {
        const prioritisation: WComponentPrioritisation = {
            ...base,
            title: date2str_auto({ date: when, time_resolution: "day" }),
            goals: {},
            datetime: { value: when },
            ...partial_wcomponent,
            type: partial_wcomponent.type, // only added to remove type warning
        }
        wcomponent = prioritisation
    }
    else if (partial_wcomponent.type === "goal")
    {
        const goal: WComponentNodeGoal = {
            ...base,
            ...partial_wcomponent,
            objective_ids: [],
            type: partial_wcomponent.type, // only added to remove type warning
        }
        wcomponent = goal
    }
    else if (partial_wcomponent.type === "action")
    {
        const action: WComponentNodeAction = {
            values_and_prediction_sets: [],
            reason_for_status: "",
            depends_on_action_ids: [],
            ...base,
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



export function prepare_new_wcomponent_object (partial_wcomponent: Partial<WComponent> & HasBaseId, creation_context: CreationContextState)
{
    let wcomponent: WComponent = {
        ...prepare_new_contextless_wcomponent_object(partial_wcomponent),
        ...get_new_created_ats(creation_context),
    }

    wcomponent = set_creation_context_label_ids(wcomponent, creation_context)

    return wcomponent
}



function set_creation_context_label_ids(wcomponent: WComponent, creation_context: CreationContextState)
{
    const cc = creation_context.creation_context
    const additional_labels = creation_context.use_creation_context && cc && cc.label_ids || []
    const existing_label_ids_list = (wcomponent.label_ids || [])
    const existing_label_ids = new Set(existing_label_ids_list)
    additional_labels.forEach(id => existing_label_ids.has(id) ? "" : existing_label_ids_list.push(id))

    return { ...wcomponent, label_ids: existing_label_ids_list }
}
