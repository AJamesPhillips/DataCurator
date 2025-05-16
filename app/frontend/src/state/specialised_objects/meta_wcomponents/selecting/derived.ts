import { is_valid_uuid } from "datacurator-core/utils/id_regexs"

import { update_substate } from "../../../../utils/update_state"
import type { RootState } from "../../../State"
import { update_derived_selected_wcomponent_ids } from "./reducer"



export function derived_meta_wcomponents_state_reducer (prev_state: RootState, state: RootState)
{
    state = handle_route_changed(prev_state, state)

    return state
}



function handle_route_changed (prev_state: RootState, state: RootState)
{
    // TODO: rethink.  We want to trigger this reducer when the application first loads
    // to correctly set the current item_id to be in the selected ids list.
    // Using the change in sync.ready is a hack.
    const ready_changed = prev_state.sync.ready_for_reading !== state.sync.ready_for_reading

    if (prev_state.routing.item_id !== state.routing.item_id || ready_changed)
    {
        if (state.routing.item_id && is_valid_uuid(state.routing.item_id))
        {
            const selected_wcomponent_ids_list = [ state.routing.item_id ]
            state = update_substate(state, "meta_wcomponents", "selected_wcomponent_ids_list", selected_wcomponent_ids_list)

            state = update_derived_selected_wcomponent_ids(state)
        }
    }

    return state
}
