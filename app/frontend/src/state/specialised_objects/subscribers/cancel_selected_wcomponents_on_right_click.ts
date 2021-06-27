import type { Store } from "redux"

import { ACTIONS } from "../../actions"
import type { CanvasPointerEvent } from "../../canvas/pub_sub"
import { pub_sub } from "../../pub_sub/pub_sub"
import type { RootState } from "../../State"



export function cancel_selected_wcomponents_on_right_click (store: Store<RootState>)
{
    pub_sub.canvas.sub("canvas_right_click", (right_click: CanvasPointerEvent) =>
    {
        store.dispatch(ACTIONS.specialised_object.clear_selected_wcomponents({}))
    })
}
