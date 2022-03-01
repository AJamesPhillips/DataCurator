import type { CanvasPointerEvent } from "../../../canvas/interfaces"
import { offset_input_by_half_node, position_to_point, round_canvas_point } from "../../../canvas/position_utils"
import { pub_sub } from "../../pub_sub/pub_sub"
import type { StoreType } from "../../store"
import { selector_chosen_base_id } from "../../user_info/selector"
import { get_current_knowledge_view_from_state } from "../accessors"
import type { AddToKnowledgeViewArgs } from "../wcomponents/actions"
import { create_wcomponent } from "../wcomponents/create_wcomponent_type"



export function create_wcomponent_on_double_tap (store: StoreType)
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


        if (state.routing.args.view !== "knowledge") return


        const position = position_from_canvas_pointer_event(double_tap)
        const add_to_knowledge_view: AddToKnowledgeViewArgs = { id: current_knowledge_view.id, position }


        create_wcomponent({
            wcomponent: { base_id, type: "statev2" },
            add_to_knowledge_view,
            store,
        })
    })
}



export function position_from_canvas_pointer_event (canvas_pointer_event: CanvasPointerEvent)
{
    const point = offset_input_by_half_node(position_to_point(canvas_pointer_event))
    const position = round_canvas_point(point, "large")
    return position
}
