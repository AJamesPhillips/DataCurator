import { get_new_wcomponent_object } from "../shared/wcomponent/get_new_wcomponent_object"
import type { WComponent } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../state/actions"
import { get_middle_of_screen } from "../state/display/display"
import { get_current_UI_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { AddToKnowledgeViewArgs } from "../state/specialised_objects/wcomponents/actions"
import { config_store } from "../state/store"



export function create_wcomponent (args: Partial<WComponent>)
{
    const store = config_store()
    const state = store.getState()

    const wcomponent = get_new_wcomponent_object(args)

    const current_knowledge_view = get_current_UI_knowledge_view_from_state(state)

    let add_to_knowledge_view: AddToKnowledgeViewArgs | undefined = undefined
    if (current_knowledge_view)
    {
        const position = get_middle_of_screen(state)

        add_to_knowledge_view = { id: current_knowledge_view.id, position }
    }

    store.dispatch(ACTIONS.specialised_object.upsert_wcomponent({ wcomponent, add_to_knowledge_view }))
    store.dispatch(ACTIONS.specialised_object.clear_selected_wcomponents({}))
    store.dispatch(ACTIONS.routing.change_route({ item_id: wcomponent.id }))
    store.dispatch(ACTIONS.display_at_created_datetime.change_display_at_created_datetime({ datetime: wcomponent.created_at }))
}
