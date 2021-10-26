import type { AnyAction } from "redux"

import { is_defined } from "../../../../shared/utils/is_defined"
import type { RootState } from "../../../State"
import {
    get_wcomponents_from_state,
} from "../../accessors"
import { tidy_wcomponent } from "../tidy_wcomponent"
import { handle_upsert_wcomponent } from "../utils"
import {
    ActionBulkEditWComponents,
    is_bulk_edit_wcomponents,
} from "./actions"



export const bulk_editing_wcomponents_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_bulk_edit_wcomponents(action))
    {
        state = handle_bulk_edit_wcomponents(state, action)
    }

    return state
}



function handle_bulk_edit_wcomponents (state: RootState, action: ActionBulkEditWComponents)
{
    const { wcomponent_ids, change } = action

    const wcomponents = get_wcomponents_from_state(state, wcomponent_ids)
        .filter(is_defined)

    if (wcomponents.length)
    {
        wcomponents.forEach(wcomponent => {
            const edited_wcomponent = { ...wcomponent, ...change }
            const tidied = tidy_wcomponent(edited_wcomponent)
            state = handle_upsert_wcomponent(state, tidied, false)
        })
    }

    return state
}
