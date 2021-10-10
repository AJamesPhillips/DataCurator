import type { Store } from "redux"

import { create_wcomponent } from "../wcomponents/create_wcomponent_type"
import type { HasBaseId } from "../../../shared/interfaces/base"
import type { WComponent } from "../../../wcomponent/interfaces/SpecialisedObjects"
import type { WComponentConnectionType } from "../../../wcomponent/interfaces/wcomponent_base"
import { ACTIONS } from "../../actions"
import type { RootState } from "../../State"
import { selector_chosen_base_id } from "../../user_info/selector"
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

        const base_id = selector_chosen_base_id(state)
        if (base_id === undefined) return

        const { terminal_type: start_terminal_type, wcomponent_id: start_wcomponent_id } = last_pointer_down_connection_terminal
        const { terminal_type: end_terminal_type, wcomponent_id: end_wcomponent_id } = state.last_action


        store.dispatch(ACTIONS.specialised_object.clear_pointerupdown_on_connection_terminal({}))

        if (start_wcomponent_id === end_wcomponent_id && start_terminal_type === end_terminal_type) return


        const { attribute: start_type, direction: start_direction } = start_terminal_type
        let { attribute: end_type, direction: end_direction } = end_terminal_type

        // This prevents connecting "from" to a "from" or "to" to a "to"
        if (start_direction === end_direction)
        {
            end_direction = end_direction === "from" ? "to" : "from"
        }
        const start_is_effector = start_direction === "from"


        const from_id = start_is_effector ? start_wcomponent_id : end_wcomponent_id
        const to_id = start_is_effector ? end_wcomponent_id : start_wcomponent_id

        const from_type = start_is_effector ? start_type : end_type
        const to_type = start_is_effector ? end_type : start_type


        const either_meta = start_type === "meta" || end_type === "meta"
        const connection_type: WComponentConnectionType = either_meta ? "relation_link" : "causal_link"

        const wcomponent: Partial<WComponent> & HasBaseId = { base_id, type: connection_type, from_id, to_id, from_type, to_type }
        create_wcomponent({ wcomponent, creation_context: state.creation_context })
    }
}
