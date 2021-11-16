import { ACTIONS } from "../actions"
import { is_change_route } from "../routing/actions"
import type { RootState } from "../State"
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
    store.subscribe(() =>
    {
        const state = store.getState()
        const current_route = state.routing.route

        if (should_display_side_panel(state))
        {
            store.dispatch(ACTIONS.controls.set_or_toggle_display_side_panel(true))
        }
    })
}



function should_display_side_panel (state: RootState)
{
    if (!state.last_action) return false // type guard

    const should_display = (
        // Probably the user has repeated an action to request a route but the side panel is not open
        // This is not 100% guaranteed so we might need to remove this functionality but at the moment
        // I am imagining that if:
        //  * the side panel is closed
        !state.controls.display_side_panel
        //  * the filter side panel (or another side panel) is already selected via the route
        //    and the user then does an action to reshow that same route e.g. by clicking the
        //    warning that a filter is applied
        && is_change_route(state.last_action)
        && state.last_action.route !== undefined
        && (
            state.last_action.route === "search"
            || state.last_action.route === "filter"
        )
    )

    if (is_change_route(state.last_action)) debugger

    return should_display
}
