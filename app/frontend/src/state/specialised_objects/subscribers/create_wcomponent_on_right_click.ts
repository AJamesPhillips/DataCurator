import type { Store } from "redux"
import { ACTIONS } from "../../actions"

import type { CanvasPointerEvent } from "../../canvas/state"
import type { RootState } from "../../State"



export function create_wcomponent_on_right_click (store: Store<RootState>)//, pubsub: PubSub)
{
    // pubsub.on_canvas_right_click((right_click: CanvasPointerEvent) =>
    // {
    //     store.dispatch(ACTIONS.specialised_object.wcom)
    // })

    let processed_last_right_click: CanvasPointerEvent | undefined = undefined

    return () =>
    {
        const state = store.getState()
        const { last_right_click } = state.canvas

        // no right click event to process
        if (!last_right_click) return

        if (processed_last_right_click && last_right_click.ms === processed_last_right_click.ms)
        {
            // already processed
            return
        }
        processed_last_right_click = last_right_click


    }
}
