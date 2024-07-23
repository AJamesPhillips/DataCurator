import {
    create_links_on_connection_terminal_mouse_events__subscriber,
    clear_last_pointer_down_connection_terminal,
} from "./create_links_on_connection_terminal_mouse_events"
import { create_wcomponent_on_double_tap } from "./create_wcomponent_on_double_tap"
import { create_wcomponent_on_keyboard } from "./create_wcomponent_on_keyboard"
import { cancel_selected_wcomponents_on_right_click } from "./cancel_selected_wcomponents_on_right_click"
import type { StoreType } from "../../store"



export function specialised_objects_subscribers (store: StoreType)
{
    pub_sub_subscribers(store)

    const create_links_on_connection_terminal_mouse_events = create_links_on_connection_terminal_mouse_events__subscriber(store)

    return () =>
    {
        create_links_on_connection_terminal_mouse_events()
    }
}



function pub_sub_subscribers (store: StoreType)
{
    cancel_selected_wcomponents_on_right_click(store)
    create_wcomponent_on_double_tap(store)
    create_wcomponent_on_keyboard(store)

    clear_last_pointer_down_connection_terminal(store)
}
