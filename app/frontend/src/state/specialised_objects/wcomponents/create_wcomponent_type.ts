import type { Store } from "redux"

import { prepare_new_wcomponent_object } from "../../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import {
    WComponent,
    wcomponent_is_judgement_or_objective,
} from "../../../wcomponent/interfaces/SpecialisedObjects"
import { get_created_at_ms } from "../../../shared/utils_datetime/utils_datetime"
import { ACTIONS } from "../../actions"
import { get_middle_of_screen } from "../../display_options/display"
import {
    get_current_composed_knowledge_view_from_state,
    get_wcomponent_from_state,
} from "../accessors"
import type { AddToKnowledgeViewArgs } from "./actions"
import type { RootState } from "../../State"
import { get_store } from "../../store"
import type { HasBaseId } from "../../../shared/interfaces/base"
import type { KnowledgeViewWComponentEntry } from "../../../shared/interfaces/knowledge_view"
import { get_latest_sim_ms_for_routing } from "../../routing/utils/get_latest_sim_ms_for_routing"



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


    const add_to_knowledge_view = get_knowledge_view_entry(args.add_to_knowledge_view, wcomponent, state)
    const add_to_top = !wcomponent_is_judgement_or_objective(wcomponent)


    let created_at_ms = get_created_at_ms(wcomponent)
    created_at_ms = Math.max(created_at_ms + ONE_MINUTE, state.routing.args.created_at_ms)


    const sim_ms = get_latest_sim_ms_for_routing(wcomponent, state)


    store.dispatch(ACTIONS.specialised_object.upsert_wcomponent({ wcomponent, add_to_knowledge_view, add_to_top }))
    store.dispatch(ACTIONS.meta_wcomponents.clear_selected_wcomponents({}))
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



function get_knowledge_view_entry (add_to_knowledge_view: AddToKnowledgeViewArgs | undefined, wcomponent: WComponent, state: RootState)
{
    const current_knowledge_view = get_current_composed_knowledge_view_from_state(state)

    if (!add_to_knowledge_view && current_knowledge_view)
    {
        let position: KnowledgeViewWComponentEntry | undefined

        if (wcomponent_is_judgement_or_objective(wcomponent))
        {
            position = current_knowledge_view.composed_wc_id_map[wcomponent.judgement_target_wcomponent_id]
        }

        if (!position)
        {
            position = get_middle_of_screen(state)
        }

        add_to_knowledge_view = { id: current_knowledge_view.id, position }
    }

    return add_to_knowledge_view
}
