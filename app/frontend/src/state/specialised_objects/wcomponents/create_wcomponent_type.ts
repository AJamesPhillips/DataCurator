import type { Store } from "redux"

import { round_canvas_point } from "../../../canvas/position_utils"
import type { CreationContextState } from "../../creation_context/state"
import { get_new_wcomponent_object } from "../../../wcomponent/get_new_wcomponent_object"
import {
    WComponent,
    wcomponent_is_judgement_or_objective,
    wcomponent_is_statev2,
    wcomponent_should_have_state_VAP_sets,
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



interface CreateWComponentArgs
{
    wcomponent: Partial<WComponent> & HasBaseId
    creation_context: CreationContextState
    add_to_knowledge_view?: AddToKnowledgeViewArgs
    must_add_to_knowledge_view?: boolean
    store?: Store<RootState>
}

export function create_wcomponent (args: CreateWComponentArgs)
{
    const store = args.store || get_store()
    const state = store.getState()

    let wcomponent = get_new_wcomponent_object(args.wcomponent, args.creation_context)
    wcomponent = set_judgement_or_objective_target(wcomponent, state)


    const current_knowledge_view = get_current_composed_knowledge_view_from_state(state)

    let { add_to_knowledge_view } = args
    if (!add_to_knowledge_view && current_knowledge_view)
    {
        const position = round_canvas_point(get_middle_of_screen(state), "large")

        add_to_knowledge_view = { id: current_knowledge_view.id, position }
    }


    const { must_add_to_knowledge_view=true } = args
    if (must_add_to_knowledge_view && !add_to_knowledge_view)
    {
        console.error("No knowledge view to add new wcomponent too")
        return false
    }


    const created_at_ms = Math.max(get_created_at_ms(wcomponent) + 60000, state.routing.args.created_at_ms)
    const datetime = new Date(created_at_ms)


    store.dispatch(ACTIONS.specialised_object.upsert_wcomponent({ wcomponent, add_to_knowledge_view }))
    store.dispatch(ACTIONS.specialised_object.clear_selected_wcomponents({}))
    store.dispatch(ACTIONS.display_at_created_datetime.change_display_at_created_datetime({ datetime }))
    store.dispatch(ACTIONS.routing.change_route({ route: "wcomponents", item_id: wcomponent.id }))
    return true
}



function set_judgement_or_objective_target (wcomponent: WComponent, state: RootState): WComponent
{
    if (wcomponent_is_judgement_or_objective(wcomponent))
    {
        const selected_wcomponents = state.meta_wcomponents.selected_wcomponent_ids_list

        if (selected_wcomponents.length === 1)
        {
            const selected_wcomponent = get_wcomponent_from_state(state, selected_wcomponents[0]!)
            if (selected_wcomponent && wcomponent_should_have_state_VAP_sets(selected_wcomponent))
            {
                wcomponent = {
                    ...wcomponent,
                    judgement_target_wcomponent_id: selected_wcomponent.id,
                }

                if (wcomponent_is_statev2(selected_wcomponent) && selected_wcomponent.subtype === "boolean")
                {
                    wcomponent.judgement_operator = "=="
                    wcomponent.judgement_comparator_value = "True"
                }
            }
        }
    }

    return wcomponent
}
