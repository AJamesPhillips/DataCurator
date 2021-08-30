import type { Store } from "redux"
import { ACTIONS } from "../../actions"

import type { RootState } from "../../State"
import { get_solid_pod_URL_or_error } from "../../sync/utils/solid"



export function sync_storage_location_subscriber (store: Store<RootState>)
{
    const starting_state = store.getState()
    let solid_pod_URL = get_solid_pod_URL_or_error(starting_state.user_info, "reducer-sync").solid_pod_URL
    // let routing_args_storage_location = state.routing.args.storage_location

    store.subscribe(() =>
    {
        const state = store.getState()

        const new_solid_pod_URL = get_solid_pod_URL_or_error(state.user_info, "reducer-sync").solid_pod_URL

        const new_routing_args_storage_location = state.routing.args.storage_location

        console .log("new_solid_pod_URL", new_solid_pod_URL, "new_routing_args_storage_location", new_routing_args_storage_location)

        if (!new_routing_args_storage_location)
        {
            if (new_solid_pod_URL)
            {
                const storage_location = new_solid_pod_URL
                console .log("Change route as no query param: ", storage_location)
                store.dispatch(ACTIONS.routing.change_route({ args: { storage_location } }))
            }
        }
        else if (new_routing_args_storage_location !== new_solid_pod_URL)
        {
            if (solid_pod_URL !== new_solid_pod_URL)
            {
                const storage_location = new_solid_pod_URL
                console .log("Change route: ", storage_location)
                store.dispatch(ACTIONS.routing.change_route({ args: { storage_location } }))
            }
            else
            {
                const chosen_solid_pod_URL = new_routing_args_storage_location
                console .log("ensure_solid_pod_URL_is_chosen: ", chosen_solid_pod_URL)
                store.dispatch(ACTIONS.user_info.ensure_solid_pod_URL_is_chosen({ chosen_solid_pod_URL }))
            }
        }

        solid_pod_URL = new_solid_pod_URL
        // routing_args_storage_location = new_routing_args_storage_location
    })
}
