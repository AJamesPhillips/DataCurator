import type { Store } from "redux"
import { ACTIONS } from "../../../actions"

import { pub_sub } from "../../../pub_sub/pub_sub"
import type { RootState } from "../../../State"
import { get_current_UI_knowledge_view_from_state } from "../../accessors"



export function meta_wcomponents_selecting_subscribers (store: Store<RootState>)
{
    handle_ctrl_a(store)
}



function handle_ctrl_a (store: Store<RootState>)
{
    pub_sub.global_keys.sub("key_down", k =>
    {
        const select_all = k.key === "a" && k.ctrl_key
        if (!select_all) return

        const state = store.getState()
        const kv = get_current_UI_knowledge_view_from_state(state)
        if (!kv) return

        const viewing_knowledge = state.routing.args.view === "knowledge"
        if (!viewing_knowledge) return

        const ids = Object.keys(kv.derived_wc_id_map)

        store.dispatch(ACTIONS.specialised_object.set_selected_wcomponents({ ids }))
        store.dispatch(ACTIONS.routing.change_route({ sub_route: "wcomponents_edit_multiple" }))
    })
}
