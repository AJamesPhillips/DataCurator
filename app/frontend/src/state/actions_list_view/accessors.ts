import { is_a_wcomponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import { RootState } from "../State"
import { get_current_composed_knowledge_view_from_state } from "../specialised_objects/accessors"



export function get_is_on_actions_list_view (state: RootState)
{
    return state.routing.args.view === "actions_list"
}



export function get_action_ids_for_actions_list_view (state: RootState)
{
    let action_ids: Set<string> = state.derived.wcomponent_ids_by_type.action

    const { apply_filter, filters } = state.filter_context

    if (!apply_filter) return action_ids


    const { filter_by_current_knowledge_view, filter_by_text } = filters
    if (filter_by_current_knowledge_view)
    {
        const composed_knowledge_view = get_current_composed_knowledge_view_from_state(state)
        if (composed_knowledge_view)
        {
            action_ids = composed_knowledge_view.wc_ids_by_type.action
        }
    }

    if (filter_by_text)
    {
        const matched_action_ids = Array.from(action_ids)
            .map(id => state.specialised_objects.wcomponents_by_id[id])
            .filter(is_a_wcomponent)
            .filter(wc =>
            {
                return wc.title.includes(filter_by_text) || wc.description.includes(filter_by_text)
            })
            .map(wc => wc.id)

        action_ids = new Set(matched_action_ids)
    }

    return action_ids
}
