import type { Store } from "redux"
import { ACTIONS } from "../actions"

import type { RootState } from "../State"
import type { RoutingState } from "./interfaces"
import { get_current_route_params, routing_state_to_string } from "./routing"



export const factory_location_hash = (store: Store<RootState>) =>
{
    let routing_state: RoutingState

    const throttled_update_location_hash = factory_throttled_update_location_hash()

    record_location_hash_change(store)

    function update_location_hash ()
    {
        const state = store.getState()
        if (state.routing === routing_state) return
        const changed_only_xy = calc_changed_only_xy(routing_state, state.routing)
        routing_state = state.routing

        throttled_update_location_hash(changed_only_xy, state.routing)
    }

    update_location_hash() // initial invocation to update hash

    return update_location_hash
}



function factory_throttled_update_location_hash ()
{
    let timer_will_update_location_hash: NodeJS.Timeout | undefined

    return (changed_only_xy: boolean, routing_state: RoutingState) =>
    {
        if (timer_will_update_location_hash)
        {
            clearTimeout(timer_will_update_location_hash)
            timer_will_update_location_hash = undefined
        }

        if (!changed_only_xy)
        {
            const route = routing_state_to_string(routing_state)
            window.location.hash = route
            return
        }

        timer_will_update_location_hash = setTimeout(() => {
            const route = routing_state_to_string(routing_state)
            window.location.hash = route
        }, 1000)
    }
}



function calc_changed_only_xy (current: RoutingState, next: RoutingState): boolean
{
    if (!current || !current.args) return false
    return current.args.x !== next.args.x || current.args.y !== next.args.y
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
                    // if (!state.sync.ready) return // TODO, do we need this?  Do we need any of this?
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
