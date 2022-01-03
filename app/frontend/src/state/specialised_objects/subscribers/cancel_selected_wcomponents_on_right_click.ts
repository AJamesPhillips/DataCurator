import type { Store } from "redux"

import type { CanvasPointerEvent } from "../../../canvas/interfaces"
import { ACTIONS } from "../../actions"
import { pub_sub } from "../../pub_sub/pub_sub"
import type { RootState } from "../../State"



export function cancel_selected_wcomponents_on_right_click (store: Store<RootState>)
{
    pub_sub.canvas.sub("canvas_right_click", (right_click: CanvasPointerEvent) =>
    {
        store.dispatch(ACTIONS.specialised_object.clear_selected_wcomponents({}))

        const { route, item_id, sub_route } = store.getState().routing
        if ((route === "wcomponents" && item_id) || sub_route === "wcomponents_edit_multiple" )
        {
            store.dispatch(ACTIONS.routing.change_route({ route: "wcomponents", sub_route: null, item_id: null }))
        }
    })
}
