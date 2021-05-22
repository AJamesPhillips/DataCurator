import type { Store } from "redux"

import { create_wcomponent } from "../../../knowledge/create_wcomponent_type"
import type { CanvasPointerEvent } from "../../canvas/pub_sub"
import { pub_sub } from "../../pub_sub/pub_sub"
import type { RootState } from "../../State"
import { get_current_knowledge_view_from_state } from "../accessors"
import type { AddToKnowledgeViewArgs } from "../wcomponents/actions"



export function create_wcomponent_on_keyboard (store: Store<RootState>)
{
    // pub_sub.global_keys.sub("nn", (double_tap: CanvasPointerEvent) =>
    // {
    //     const state = store.getState()

    //     const current_knowledge_view = get_current_knowledge_view_from_state(state)
    //     if (!current_knowledge_view)
    //     {
    //         console.error("No current_knowledge_view despite canvas double_tap")
    //         return // should never happen
    //     }

    //     const add_to_knowledge_view: AddToKnowledgeViewArgs = {
    //         id: current_knowledge_view.id,
    //         position: { left: double_tap.x - 20, top: -double_tap.y - 20 }
    //     }


    //     create_wcomponent({
    //         wcomponent: { type: "state" },
    //         creation_context: state.creation_context,
    //         add_to_knowledge_view,
    //         store,
    //     })
    // })
}
