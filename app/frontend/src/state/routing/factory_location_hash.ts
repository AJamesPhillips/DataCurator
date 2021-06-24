import type { Store } from "redux"
import { throttle } from "../../utils/throttle"

import { ACTIONS } from "../actions"
import type { RootState } from "../State"
import type { RoutingState } from "./interfaces"
import { merge_route_params_prioritising_window_location, routing_state_to_string } from "./routing"



export const factory_location_hash = (store: Store<RootState>) =>
{
    let routing_state: RoutingState

    const throttled_update_location_hash = factory_throttled_update_location_hash()

    record_location_hash_change(store)

    function store_subscriber_to_update_location_hash ()
    {
        const state = store.getState()
        if (state.routing === routing_state) return
        const changed_only_xy = calc_changed_only_xy(routing_state, state.routing)
        routing_state = state.routing

        throttled_update_location_hash(changed_only_xy, state.routing)
    }

    store_subscriber_to_update_location_hash() // initial invocation to update hash

    return store_subscriber_to_update_location_hash
}



declare global {
    interface Window { DEBUG_ROUTING: any }
}

function factory_throttled_update_location_hash ()
{
    const update_location_hash_after_1000 = throttle((routing_state: RoutingState) => {
        const route = routing_state_to_string(routing_state)
        if (window.DEBUG_ROUTING) console .log("DELAYED changing route from ", window.location.hash.toString(), "   to:   ", route)
        window.location.hash = route
    }, 1000)


    const debounced_update_location_hash = throttle((routing_state: RoutingState) => {
        const route = routing_state_to_string(routing_state)
        if (window.DEBUG_ROUTING) console .log("Debounced changing route from ", window.location.hash.toString(), "   to:   ", route)
        window.location.hash = route
    }, 0)


    return (changed_only_xy: boolean, routing_state: RoutingState) =>
    {
        if (changed_only_xy)
        {
            update_location_hash_after_1000.throttled(routing_state)
        }
        else
        {
            update_location_hash_after_1000.cancel()
            debounced_update_location_hash.cancel()
            debounced_update_location_hash.throttled(routing_state)
        }
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
    // let promise_state_ready: Promise<void>
    window.onhashchange = (e: HashChangeEvent) =>
    {
        const state = store.getState()
        if (!state.sync.ready)
        {
            // if (promise_state_ready) return
            // promise_state_ready = new Promise<void>(resolve =>
            // {
            //     const unsubscribe = store.subscribe(() => {
            //         // if (!state.sync.ready) return // TODO, do we need this?  Do we need any of this?
            //         unsubscribe()
            //         resolve()
            //     })
            // })
            // .then(() =>
            // {
            //     const routing_params = get_current_route_params(store.getState().routing)
            //     store.dispatch(ACTIONS.routing.change_route(routing_params))
            // })
        }
        else
        {
            const route_from_hash = "#" + (e.newURL.split("#")[1] || "")
            const route_from_state = routing_state_to_string(state.routing)
            const no_difference = route_from_state === route_from_hash

            if (no_difference)
            {
                if (window.DEBUG_ROUTING) console .log("on hash change but no difference to current hash route_from_state", route_from_state)
                return
            }
            if (window.DEBUG_ROUTING) console .log("on hash change difference.  new url is: ", route_from_hash, "   state is:   ", route_from_state)

            store.dispatch(ACTIONS.specialised_object.clear_selected_wcomponents({}))
            const routing_params = merge_route_params_prioritising_window_location(e.newURL, state.routing)
            store.dispatch(ACTIONS.routing.change_route(routing_params))
        }
    }
}
