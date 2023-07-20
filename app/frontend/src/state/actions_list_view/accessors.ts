import { RootState } from "../State"



export function get_is_on_actions_list_view (state: RootState)
{
    return state.routing.args.view === "actions_list"
}
