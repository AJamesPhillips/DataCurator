import { ACTIONS } from "../actions"
import type { StoreType } from "../store"



export function controls_subscribers (store: StoreType)
{
    show_side_panel_on_change_route(store)
}


// We show the side panel:
//  a) Because when a component is selected from the search window it will be useful to show its information
//     and be able to easily navigate to it.
//  b) Because when clicking the "ActiveFilterWarning", we want to show the filter
//  c) Hacky: also because the SearchWindow component is nested in the side panel and if the side panel
//     is not shown then the search window is not shown
function show_side_panel_on_change_route (store: StoreType)
{
    let last_route = store.getState().routing.route

    store.subscribe(() =>
    {
        const state = store.getState()
        const current_route = state.routing.route
        const { display_side_panel } = state.controls

        if (last_route === current_route) return
        if (display_side_panel) return

        store.dispatch(ACTIONS.controls.toggle_display_side_panel())
    })
}
