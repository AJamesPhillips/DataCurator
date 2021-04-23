import type { AnyAction } from "redux"

import type { RootState } from "../State"
import { is_change_route } from "./actions"
import { merge_routing_state } from "./merge_routing_state"
import { routing_args_to_string } from "./routing"



export const routing_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_change_route(action))
    {
        const {
            route,
            sub_route,
            item_id,
            args,
        } = state.routing

        const merged = merge_routing_state(state.routing, action)

        const changed = (
            route !== merged.route
            || sub_route !== merged.sub_route
            || item_id !== merged.item_id
            || routing_args_to_string(args) !== routing_args_to_string(merged.args)
        )

        if (changed)
        {
            state = { ...state, routing: merged }
        }
    }

    return state
}
