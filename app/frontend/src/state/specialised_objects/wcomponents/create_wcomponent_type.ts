import type { Store } from "redux"

import type { HasBaseId } from "../../../shared/interfaces/base"
import { get_items_by_id } from "../../../shared/utils/get_items"
import { get_created_at_ms } from "../../../shared/utils_datetime/utils_datetime"
import { prepare_new_wcomponent_object } from "../../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { get_wcomponent_VAPs_represent } from "../../../wcomponent/get_wcomponent_VAPs_represent"
import {
    WComponent,
    wcomponent_is_action,
    wcomponent_is_judgement_or_objective,
    wcomponent_is_state_value,
    wcomponent_is_statev2,
} from "../../../wcomponent/interfaces/SpecialisedObjects"
import type { WComponentStateValue } from "../../../wcomponent/interfaces/state"
import { get_possibilities_from_VAP_sets } from "../../../wcomponent/value_possibilities/get_possibilities_from_VAP_sets"
import { ACTIONS } from "../../actions"
import { get_middle_of_screen } from "../../display_options/display"
import { get_latest_sim_ms_for_routing } from "../../routing/utils/get_latest_sim_ms_for_routing"
import type { RootState } from "../../State"
import { get_store } from "../../store"
import {
    get_current_composed_knowledge_view_from_state,
    get_wcomponent_from_state,
} from "../accessors"
import { get_default_parent_goal_or_action_ids } from "../get_default_parent_goal_or_action_ids"
import type { AddToKnowledgeViewArgs } from "./actions"



const ONE_MINUTE = 60 * 1000


interface CreateWComponentArgs
{
    wcomponent: Partial<WComponent> & HasBaseId
    add_to_knowledge_view?: AddToKnowledgeViewArgs
    store?: Store<RootState>
}

export function create_wcomponent (args: CreateWComponentArgs)
{
    const store = args.store || get_store()
    const state = store.getState()
    const creation_context = state.creation_context

    let wcomponent = prepare_new_wcomponent_object(args.wcomponent, creation_context)
    wcomponent = set_judgement_or_objective_target(wcomponent, state)
    wcomponent = set_parent_goal_or_action_ids(wcomponent, state)
    wcomponent = set_state_value_fields(wcomponent, state)


    const add_to_knowledge_view = get_knowledge_view_entry(args.add_to_knowledge_view, wcomponent, state)
    const add_to_top = !wcomponent_is_judgement_or_objective(wcomponent)


    let created_at_ms = get_created_at_ms(wcomponent)
    created_at_ms = Math.max(created_at_ms + ONE_MINUTE, state.routing.args.created_at_ms)


    const sim_ms = get_latest_sim_ms_for_routing(wcomponent, state)


    store.dispatch(ACTIONS.specialised_object.upsert_wcomponent({ wcomponent, add_to_knowledge_view, add_to_top }))
    store.dispatch(ACTIONS.meta_wcomponents.clear_selected_wcomponents())
    store.dispatch(ACTIONS.routing.change_route({
        route: "wcomponents",
        item_id: wcomponent.id,
        args: { created_at_ms, sim_ms },
    }))
    return true
}



function set_judgement_or_objective_target (wcomponent: WComponent, state: RootState): WComponent
{
    if (wcomponent_is_judgement_or_objective(wcomponent))
    {
        const selected_wcomponent_ids = state.meta_wcomponents.selected_wcomponent_ids_list
        const selected_wcomponent_id = selected_wcomponent_ids[0]

        if (selected_wcomponent_ids.length === 1 && selected_wcomponent_id)
        {
            const selected_wcomponent = get_wcomponent_from_state(state, selected_wcomponent_id)
            if (selected_wcomponent)
            {
                wcomponent = {
                    ...wcomponent,
                    judgement_target_wcomponent_id: selected_wcomponent.id,
                }
            }
        }
    }

    return wcomponent
}



function set_parent_goal_or_action_ids (wcomponent: WComponent, state: RootState): WComponent
{
    if (!wcomponent_is_action(wcomponent)) return wcomponent

    if (wcomponent.parent_goal_or_action_ids) return wcomponent


    const composed_knowledge_view = get_current_composed_knowledge_view_from_state(state)
    const { wcomponents_by_id, knowledge_views_by_id } = state.specialised_objects

    const knowledge_view_id = composed_knowledge_view?.id
    const parent_goal_or_action_ids = get_default_parent_goal_or_action_ids(knowledge_view_id, knowledge_views_by_id, wcomponents_by_id)

    return {
        ...wcomponent,
        parent_goal_or_action_ids,
    }
}



function get_knowledge_view_entry (add_to_knowledge_view: AddToKnowledgeViewArgs | undefined, wcomponent: WComponent, state: RootState)
{
    const current_knowledge_view = get_current_composed_knowledge_view_from_state(state)

    if (!add_to_knowledge_view && current_knowledge_view)
    {
        let target_wcomponent_id: string | undefined = undefined
        if (wcomponent_is_judgement_or_objective(wcomponent))
        {
            target_wcomponent_id = wcomponent.judgement_target_wcomponent_id
        }
        else if (wcomponent_is_state_value(wcomponent))
        {
            target_wcomponent_id = wcomponent.attribute_wcomponent_id
        }


        let position = current_knowledge_view.composed_wc_id_map[target_wcomponent_id || ""]
        if (!position)
        {
            position = get_middle_of_screen(state)
        }

        add_to_knowledge_view = { id: current_knowledge_view.id, position }
    }

    return add_to_knowledge_view
}



function set_state_value_fields (wcomponent: WComponent, state: RootState): WComponent
{
    if (wcomponent_is_state_value(wcomponent))
    {
        const { wcomponents_by_id } = state.specialised_objects

        let { attribute_wcomponent_id, value_possibilities } = wcomponent

        const selected_wcomponent_ids = state.meta_wcomponents.selected_wcomponent_ids_list
        const selected_wcomponent_id = selected_wcomponent_ids[0]

        if (selected_wcomponent_ids.length === 1 && selected_wcomponent_id)
        {
            const selected_wcomponent = get_wcomponent_from_state(state, selected_wcomponent_id)
            if (selected_wcomponent && wcomponent_is_statev2(selected_wcomponent))
            {
                const attribute_wcomponent = selected_wcomponent
                attribute_wcomponent_id = selected_wcomponent.id


                if (!value_possibilities || !Object.keys(value_possibilities).length)
                {
                    const VAPs_represent = get_wcomponent_VAPs_represent(attribute_wcomponent, wcomponents_by_id)
                    const possible_values = get_possibilities_from_VAP_sets(VAPs_represent, attribute_wcomponent.value_possibilities, attribute_wcomponent.values_and_prediction_sets || [])
                    value_possibilities = get_items_by_id(possible_values, "attribute's possible_values")
                }
            }
        }

        wcomponent = {
            ...wcomponent,
            attribute_wcomponent_id,
            value_possibilities,
        } as WComponentStateValue
    }

    return wcomponent
}
