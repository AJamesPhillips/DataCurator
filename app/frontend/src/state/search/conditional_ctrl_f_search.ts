import { ACTIONS } from "../actions"
import type { ActionKeyEventArgs } from "../global_keys/actions"
import type { StoreType } from "../store"



export function conditional_ctrl_f_search (store: StoreType, e: ActionKeyEventArgs)
{
    if (e.ctrl_key && e.key === "f")
    {
        const state = store.getState()

        const on_search_page = state.routing.route === "search"
        if (!on_search_page)
        {
            store.dispatch(ACTIONS.routing.change_route({ route: "search" }))
        }
    }
}
