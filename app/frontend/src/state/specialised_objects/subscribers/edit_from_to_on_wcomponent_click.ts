import type { Store } from "redux"

import { connection_terminal_type_is_effector } from "../../../knowledge/utils"
import { wcomponent_is_plain_connection } from "../../../shared/models/interfaces/SpecialisedObjects"
import { ACTIONS } from "../../actions"
import type { RootState } from "../../State"
import { is_clicked_wcomponent } from "../meta_wcomponents/selecting/actions"



export function edit_from_to_on_wcomponent_click (store: Store<RootState>)
{
    return () =>
    {
        const state = store.getState()


        if (!state.last_action || !is_clicked_wcomponent(state.last_action)) return


        const last_clicked_wcomponent_id = state.meta_wcomponents.last_clicked_wcomponent_id
        const intercept_wcomponent_click_to_edit_link = state.meta_wcomponents.intercept_wcomponent_click_to_edit_link

        if (!last_clicked_wcomponent_id || !intercept_wcomponent_click_to_edit_link) return

        const { edit_wcomponent_id, connection_terminal_type } = intercept_wcomponent_click_to_edit_link
        const wcomponent = state.specialised_objects.wcomponents_by_id[edit_wcomponent_id]

        if (!wcomponent)
        {
            console.error(`Could not find wcomponent to edit (id: "${edit_wcomponent_id}") for intercept_wcomponent_click_to_edit_link`)
            return
        }

        if (!wcomponent_is_plain_connection(wcomponent))
        {
            console.error(`wcomponent to edit (id: "${edit_wcomponent_id}") is not a plain connection for intercept_wcomponent_click_to_edit_link`)
            return
        }

        const new_wcomponent = { ...wcomponent }
        if (connection_terminal_type_is_effector(connection_terminal_type))
        {
            new_wcomponent.from_id = last_clicked_wcomponent_id
        }
        else new_wcomponent.to_id = last_clicked_wcomponent_id

        store.dispatch(ACTIONS.specialised_object.upsert_wcomponent({ wcomponent: new_wcomponent }))
    }
}
