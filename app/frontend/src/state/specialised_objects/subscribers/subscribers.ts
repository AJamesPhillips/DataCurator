import type { Store } from "redux"

import type { RootState } from "../../State"
import { create_links_on_connection_terminal_mouse_events } from "./create_links_on_connection_terminal_mouse_events"
// import { edit_from_to_on_wcomponent_click } from "./edit_from_to_on_wcomponent_click"
import { ensure_base_knowledge_view_subscriber } from "./ensure_base_knowledge_view_subscriber"



export function specialised_objects_subscribers (store: Store<RootState>)
{
    // const e = edit_from_to_on_wcomponent_click(store)
    const c = create_links_on_connection_terminal_mouse_events(store)
    const ensure_base_knowledge_view = ensure_base_knowledge_view_subscriber(store)

    return () =>
    {
        // e()
        c()
        ensure_base_knowledge_view()
    }
}
