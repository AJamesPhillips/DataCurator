import type { Store } from "redux"
import { ACTIONS } from "../actions"

import type { RootState, RoutingState } from "../State"
import { get_current_route_params, routing_state_to_string } from "./routing"



export const factory_location_hash = (store: Store<RootState>) =>
{
    let routing_state: RoutingState

    record_location_hash_change(store)

    function update_location_hash ()
    {
        const state = store.getState()
        if (routing_state === state.routing) return
        routing_state = state.routing

        const route = routing_state_to_string(routing_state)
        window.location.hash = route
    }

    update_location_hash() // initial invocation to update hash

    return update_location_hash
}



function record_location_hash_change (store: Store<RootState>)
{
    /**
     * Update the route to reflect any manual change of the hash route by the user
     * editing the url, or by pressing the navigation buttons.
     * Or from when the page first loads and the route changes then.
     */
    let promise_state_ready: Promise<void>
    window.onhashchange = () =>
    {
        const state = store.getState()
        if (!state.sync.ready)
        {
            if (promise_state_ready) return
            promise_state_ready = new Promise<void>(resolve =>
            {
                const unsubscribe = store.subscribe(() => {
                    unsubscribe()
                    resolve()
                })
            })
            .then(() =>
            {
                const routing_params = get_current_route_params(store.getState().routing)
                store.dispatch(ACTIONS.routing.change_route(routing_params))
            })

        }
        else
        {
            const routing_params = get_current_route_params(state.routing)
            store.dispatch(ACTIONS.routing.change_route(routing_params))
        }
    }
}
