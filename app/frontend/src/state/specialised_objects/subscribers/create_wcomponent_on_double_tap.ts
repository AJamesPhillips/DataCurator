import type { Store } from "redux"
import { offset_by_half_node, position_to_point, round_canvas_point } from "../../../canvas/position_utils"

import { create_wcomponent } from "../wcomponents/create_wcomponent_type"
import type { CanvasPointerEvent } from "../../canvas/pub_sub"
import { pub_sub } from "../../pub_sub/pub_sub"
import type { RootState } from "../../State"
import { selector_chosen_base_id } from "../../user_info/selector"
import { get_current_knowledge_view_from_state } from "../accessors"
import type { AddToKnowledgeViewArgs } from "../wcomponents/actions"



export function create_wcomponent_on_double_tap (store: Store<RootState>)
{
    pub_sub.canvas.sub("canvas_double_tap", (double_tap: CanvasPointerEvent) =>
    {
        const state = store.getState()

        const current_knowledge_view = get_current_knowledge_view_from_state(state)
        if (!current_knowledge_view)
        {
            console.error("No current_knowledge_view despite canvas double_tap")
            return // should never happen
        }


        const base_id = selector_chosen_base_id(state)
        if (base_id === undefined)
        {
            console.error("No base_id despite canvas double_tap")
            return // should never happen
        }


        if (state.display_options.consumption_formatting) return


        const point = offset_by_half_node(position_to_point(double_tap))
        const position = round_canvas_point(point, "large")
        const add_to_knowledge_view: AddToKnowledgeViewArgs = { id: current_knowledge_view.id, position }


        create_wcomponent({
            wcomponent: { base_id, type: "statev2" },
            add_to_knowledge_view,
            store,
        })
    })
}
