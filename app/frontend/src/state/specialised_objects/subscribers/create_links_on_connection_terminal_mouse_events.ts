import type { Store } from "redux"

import type { HasBaseId } from "../../../shared/interfaces/base"
import type { ConnectionTerminalSideType, ConnectionTerminalType, WComponent } from "../../../wcomponent/interfaces/SpecialisedObjects"
import type { WComponentConnectionType } from "../../../wcomponent/interfaces/wcomponent_base"
import { ACTIONS } from "../../actions"
import { pub_sub } from "../../pub_sub/pub_sub"
import type { RootState } from "../../State"
import { selector_chosen_base_id } from "../../user_info/selector"
import { is_pointerup_on_component, is_pointerup_on_connection_terminal } from "../meta_wcomponents/selecting/actions"
import { create_wcomponent } from "../wcomponents/create_wcomponent_type"



export function create_links_on_connection_terminal_mouse_events__subscriber (store: Store<RootState>)
{
    return () =>
    {
        const state = store.getState()

        const { last_pointer_down_connection_terminal } = state.meta_wcomponents
        if (!last_pointer_down_connection_terminal) return


        const base_id = selector_chosen_base_id(state)
        if (base_id === undefined) return


        if (state.global_keys.last_key === "Escape" || state.display_options.consumption_formatting)
        {
            store.dispatch(ACTIONS.meta_wcomponents.clear_pointerupdown_on_connection_terminal())
            return
        }

        if (!state.last_action) return


        let should_not_create_new_connection = false


        const {
            terminal_type: start_terminal_type,
            wcomponent_id: start_wcomponent_id,
        } = last_pointer_down_connection_terminal
        const start_attribute = start_terminal_type?.attribute || "state"
        let start_side = start_terminal_type?.side

        let end_wcomponent_id: string
        let end_attribute: ConnectionTerminalType["attribute"] = "state"
        let end_side: ConnectionTerminalSideType = (start_terminal_type?.side || "right") === "right" ? "left" : "right"
        if (is_pointerup_on_component(state.last_action))
        {
            end_wcomponent_id = state.last_action.wcomponent_id
            // Check if user has just clicked on a component, i.e. if start direction is undefined then
            // they must have just pointer down and pointer up on the same node
            should_not_create_new_connection = start_wcomponent_id === end_wcomponent_id && start_terminal_type?.side === undefined
        }
        else if (is_pointerup_on_connection_terminal(state.last_action))
        {
            end_wcomponent_id = state.last_action.wcomponent_id
            end_attribute = state.last_action.terminal_type.attribute
            end_side = state.last_action.terminal_type.side
        }
        else return

        should_not_create_new_connection = should_not_create_new_connection || (start_wcomponent_id === end_wcomponent_id && start_side === end_side)

        store.dispatch(ACTIONS.meta_wcomponents.clear_pointerupdown_on_connection_terminal())

        if (should_not_create_new_connection) return


        // This prevents connecting from and to the same side of a component
        // And it ensures start_side has value if it does not have one yet, e.g. if the user
        // had pointer down on a component and pointer up on a terminal
        start_side = end_side === "right" ? "left" : "right"

        const start_is_effector = start_side === "right"


        const from_id: string = start_is_effector ? start_wcomponent_id : end_wcomponent_id
        const to_id: string   = start_is_effector ? end_wcomponent_id : start_wcomponent_id

        const from_type: ConnectionTerminalType["attribute"] = start_is_effector ? start_attribute : end_attribute
        const to_type: ConnectionTerminalType["attribute"] = start_is_effector ? end_attribute : start_attribute


        const either_meta = start_attribute === "meta" || end_attribute === "meta"
        const connection_type: WComponentConnectionType = either_meta ? "relation_link" : "causal_link"

        const wcomponent: Partial<WComponent> & HasBaseId = { base_id, type: connection_type, from_id, to_id, from_type, to_type }
        create_wcomponent({ wcomponent })
    }
}



export function clear_last_pointer_down_connection_terminal (store: Store<RootState>)
{
    function optionally_dispatch_action_to_clear_last_pointer_down_connection_terminal ()
    {
        const state = store.getState()

        const { last_pointer_down_connection_terminal } = state.meta_wcomponents
        if (!last_pointer_down_connection_terminal) return

        store.dispatch(ACTIONS.meta_wcomponents.clear_pointerupdown_on_connection_terminal())
    }


    pub_sub.canvas.sub("canvas_right_click", () =>
    {
        optionally_dispatch_action_to_clear_last_pointer_down_connection_terminal()
    })

    pub_sub.canvas.sub("canvas_pointer_down", () =>
    {
        optionally_dispatch_action_to_clear_last_pointer_down_connection_terminal()
    })

    pub_sub.canvas.sub("canvas_pointer_up", () =>
    {
        optionally_dispatch_action_to_clear_last_pointer_down_connection_terminal()
    })
}
