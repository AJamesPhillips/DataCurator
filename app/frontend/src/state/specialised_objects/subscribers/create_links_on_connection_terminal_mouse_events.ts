import type { Store } from "redux"

import { create_wcomponent } from "../../../knowledge/create_wcomponent_type"
import { connection_terminal_location_to_type } from "../../../knowledge/utils"
import { ACTIONS } from "../../actions"
import type { RootState } from "../../State"
import { is_pointerup_on_connection_terminal } from "../meta_wcomponents/selecting/actions"



export function create_links_on_connection_terminal_mouse_events (store: Store<RootState>)
{
    return () =>
    {
        const state = store.getState()

        const { last_pointer_down_connection_terminal } = state.meta_wcomponents
        if (!last_pointer_down_connection_terminal) return

        if (state.global_keys.last_key === "Escape")
        {
            store.dispatch(ACTIONS.specialised_object.clear_pointerupdown_on_connection_terminal({}))
            return
        }

        if (!state.last_action) return

        if (!is_pointerup_on_connection_terminal(state.last_action)) return

        const { connection_location: start_connection_location, wcomponent_id: start_wcomponent_id } = last_pointer_down_connection_terminal
        const { connection_location: end_connection_location, wcomponent_id: end_wcomponent_id } = state.last_action


        store.dispatch(ACTIONS.specialised_object.clear_pointerupdown_on_connection_terminal({}))

        if (start_wcomponent_id === end_wcomponent_id && start_connection_location === end_connection_location) return


        let { type: start_type, is_effector: start_is_effector, is_meta: start_is_meta
        } = connection_terminal_location_to_type(start_connection_location)
        let { type: end_type, is_effector: end_is_effector, is_meta: end_is_meta
        } = connection_terminal_location_to_type(end_connection_location)

        // this is temporary until we get distinct "meta" nodes
        if (start_is_meta || end_is_meta) {
            if (start_is_meta && end_is_meta)
            {
                start_type = "meta"
                start_is_effector = true
            }
        }
        // This prevents connecting "from" to a "from" or "to" to a "to"
        else if (start_is_effector === end_is_effector) return

        const from_id = start_is_effector ? start_wcomponent_id : end_wcomponent_id
        const to_id = start_is_effector ? end_wcomponent_id : start_wcomponent_id

        const from_type = start_is_effector ? start_type : end_type
        const to_type = start_is_effector ? end_type : start_type

        create_wcomponent({ type: "causal_link", from_id, to_id, from_type, to_type })
    }
}
