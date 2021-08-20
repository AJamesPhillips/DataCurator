import type { Store } from "redux"
import { ACTIONS } from "../actions"

import type { RootState } from "../State"



export function conditional_ctrl_f_search (store: Store<RootState>)
{
    store.subscribe(() =>
    {
        const state = store.getState()
        const ctrl_f_search = is_ctrl_f_search(state)
        const on_search_page = state.routing.route === "search"

        if (ctrl_f_search && !on_search_page)
        {
            store.dispatch(ACTIONS.routing.change_route({ route: "search" }))
        }
    })
}



export function is_ctrl_f_search (state: RootState)
{
    // Ctrl+f to search
    return state.global_keys.keys_down.has("f") && state.global_keys.keys_down.has("Control")
}
