import type { Store } from "redux"

import type { CreationContextState } from "../shared/creation_context/state"
import { get_new_wcomponent_object } from "../shared/wcomponent/get_new_wcomponent_object"
import type { WComponent } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_created_at_ms } from "../shared/wcomponent/utils_datetime"
import { ACTIONS } from "../state/actions"
import { get_middle_of_screen } from "../state/display_options/display"
import { get_current_UI_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { AddToKnowledgeViewArgs } from "../state/specialised_objects/wcomponents/actions"
import type { RootState } from "../state/State"
import { config_store } from "../state/store"



interface CreateWComponentArgs
{
    wcomponent: Partial<WComponent>
    creation_context: CreationContextState
    add_to_knowledge_view?: AddToKnowledgeViewArgs
    must_add_to_knowledge_view?: boolean
    store?: Store<RootState>
}

export function create_wcomponent (args: CreateWComponentArgs)
{
    const store = args.store || config_store()
    const state = store.getState()

    const wcomponent = get_new_wcomponent_object(args.wcomponent, args.creation_context)

    const current_knowledge_view = get_current_UI_knowledge_view_from_state(state)

    let { add_to_knowledge_view } = args
    if (!add_to_knowledge_view && current_knowledge_view)
    {
        const position = get_middle_of_screen(state)

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
