import type { Action, AnyAction } from "redux"

import { update_substate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { get_current_composed_knowledge_view_from_state } from "../accessors"



export const highlighting_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_set_highlighted_wcomponent(action))
    {
        const { id, highlighted } = action
        let highlighted_wcomponent_ids = new Set(state.meta_wcomponents.highlighted_wcomponent_ids)

        if (id === undefined) highlighted_wcomponent_ids = new Set()
        else
        {
            if (highlighted) highlighted_wcomponent_ids.add(id)
            else highlighted_wcomponent_ids.delete(id)
        }


        state = update_substate(state, "meta_wcomponents", "highlighted_wcomponent_ids", highlighted_wcomponent_ids)


        let { neighbour_ids_of_highlighted_wcomponent } = state.meta_wcomponents
        const focused_mode = state.display_options.focused_mode
        if (focused_mode)
        {
            const current_kv = get_current_composed_knowledge_view_from_state(state)
            if (current_kv)
            {
                neighbour_ids_of_highlighted_wcomponent = new Set()
                if (id !== undefined)
                {
                    const connected_ids = current_kv.wc_id_connections_map[id]
                    if (connected_ids)
                    {
                        neighbour_ids_of_highlighted_wcomponent = connected_ids
                    }
                }
            }
        }
        else if (neighbour_ids_of_highlighted_wcomponent.size)
        {
            // ensure neighbour_ids_of_highlighted_wcomponent is empty
            neighbour_ids_of_highlighted_wcomponent = new Set()
        }

        state = update_substate(state, "meta_wcomponents", "neighbour_ids_of_highlighted_wcomponent", neighbour_ids_of_highlighted_wcomponent)
    }


    return state
}



interface ActionHighlightedWComponent extends Action, HighlightedWComponentProps {}

const set_highlighted_wcomponent_type = "set_highlighted_wcomponent"


interface HighlightedWComponentProps
{
    id: string | undefined
    highlighted: boolean
}
const set_highlighted_wcomponent = (args: HighlightedWComponentProps): ActionHighlightedWComponent =>
{
    return {
        type: set_highlighted_wcomponent_type,
        id: args.id,
        highlighted: args.highlighted,
    }
}

const is_set_highlighted_wcomponent = (action: AnyAction): action is ActionHighlightedWComponent => {
    return action.type === set_highlighted_wcomponent_type
}



export const highlighting_actions = {
    set_highlighted_wcomponent,
}
