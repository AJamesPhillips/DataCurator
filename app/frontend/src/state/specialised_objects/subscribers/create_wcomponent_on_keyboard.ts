import type { Store } from "redux"

import type { RootState } from "../../State"



export function create_wcomponent_on_keyboard (store: Store<RootState>)
{
    // pub_sub.global_keys.sub("nn", (double_tap: Pointer) =>
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
    //         add_to_knowledge_view,
    //         store,
    //     })
    // })
}
