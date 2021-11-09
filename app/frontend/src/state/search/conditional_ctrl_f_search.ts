import { ACTIONS } from "../actions"
import type { ActionKeyEventArgs } from "../global_keys/actions"
import type { StoreType } from "../store"



export function conditional_ctrl_f_search (store: StoreType, e: ActionKeyEventArgs)
{
    if (e.ctrl_key && e.key === "f")
    {
        const state = store.getState()

        // We show the side panel:
        //  a) Because when a component is selected it will be useful to show its information
        //     and be able to easily navigate to it.
        //  b) Also because the SearchWindow component is nested in the side panel and if the side panel
        //     is not shown then the search window is not shown
        const showing_side_panel = state.controls.display_side_panel
        if (!showing_side_panel)
        {
            store.dispatch(ACTIONS.controls.toggle_display_side_panel())
        }

        const on_search_page = state.routing.route === "search"
        if (!on_search_page)
        {
            store.dispatch(ACTIONS.routing.change_route({ route: "search" }))
        }
    }
}
