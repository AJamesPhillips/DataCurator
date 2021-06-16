import type { Store } from "redux"

import type { RootState } from "../../State"
import { create_links_on_connection_terminal_mouse_events } from "./create_links_on_connection_terminal_mouse_events"
import { create_wcomponent_on_double_tap } from "./create_wcomponent_on_double_tap"
import { create_wcomponent_on_keyboard } from "./create_wcomponent_on_keyboard"
import { create_wcomponent_on_right_click } from "./create_wcomponent_on_right_click"
import { ensure_base_knowledge_view_subscriber } from "./ensure_base_knowledge_view_subscriber"



export function specialised_objects_subscribers (store: Store<RootState>)
{
    dispatchers(store)

    const c = create_links_on_connection_terminal_mouse_events(store)
    const ensure_base_knowledge_view = ensure_base_knowledge_view_subscriber(store)

    return () =>
    {
        c()
        // TODO move to one off call after data is first loaded?
        ensure_base_knowledge_view()
    }
}



function dispatchers (store: Store<RootState>)
{
    // create_wcomponent_on_right_click(store)
    create_wcomponent_on_double_tap(store)
    create_wcomponent_on_keyboard(store)
}
