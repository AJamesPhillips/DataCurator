import { RootState } from "../State"



export function get_is_on_actions_list_view (state: RootState)
{
    return state.routing.args.view === "actions_list"
}



export function get_action_ids_for_actions_list_view (state: RootState)
{
    let action_ids: Set<string> | undefined = undefined

    const filter_by_knowledge_view = false
    if (filter_by_knowledge_view)
    {
        // const composed_knowledge_view = get_current_composed_knowledge_view_from_state(state)
        // if (composed_knowledge_view)
        // {
        //     action_ids = composed_knowledge_view.wc_ids_by_type.action
        // }
    }
    else action_ids = state.derived.wcomponent_ids_by_type.action

    return action_ids
}
