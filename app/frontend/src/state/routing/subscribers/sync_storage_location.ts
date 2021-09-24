import type { Store } from "redux"

import { ACTIONS } from "../../actions"
import type { RootState } from "../../State"



export function sync_storage_location_subscriber (store: Store<RootState>)
{
    const starting_state = store.getState()
    let { chosen_base_id: base_id } = starting_state.user_info

    store.subscribe(() =>
    {
        const state = store.getState()
        const { chosen_base_id: new_base_id } = starting_state.user_info
        const { storage_location: new_routing_args_storage_location } = state.routing.args


        if (new_routing_args_storage_location === undefined)
        {
            if (new_routing_args_storage_location !== new_base_id)
            {
                console .log(`Change storage_location in route to "${new_base_id}" as nothing was set`)
                store.dispatch(ACTIONS.routing.change_route({ args: { storage_location: new_base_id } }))
            }
        }
        else if (new_routing_args_storage_location !== new_base_id)
        {
            if (base_id !== new_base_id)
            {
                console .log("Change route: ", new_base_id)
                store.dispatch(ACTIONS.routing.change_route({ args: { storage_location: new_base_id } }))
            }
            else
            {
                // User has changed url manually so change the chosen_base_id
                store.dispatch(ACTIONS.user_info.update_chosen_base_id({ base_id: new_routing_args_storage_location }))
            }
        }

        base_id = new_base_id
    })
}
