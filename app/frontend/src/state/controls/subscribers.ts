import { ACTIONS } from "../actions"
import { is_change_route } from "../routing/actions"
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
        if (display_side_panel) return
        if (last_route === current_route)
        {
            if (!state.last_action) return
            if (!is_change_route(state.last_action)) return
            if (!state.last_action.route) return
            // Probably the user has repeated an action to request a route but the side panel is not open
            // This is not 100% guaranteed so we might need to remove this functionality but at the moment
            // I am imagining that if:
            //  * the side panel is closed
            //  * the filter menu is already selected
            //  * a filter is applied
            // If the user then clicks the warning that a filter is applied then these checks will allow
            // for the sidepanel to be opened.
        }

        store.dispatch(ACTIONS.controls.toggle_display_side_panel())
    })
}
