import type { AnyAction } from "redux"

import { is_defined } from "../../../../shared/utils/is_defined"
import type { WComponent, WComponentCommon } from "../../../../wcomponent/interfaces/SpecialisedObjects"
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
    const { wcomponent_ids, change, remove_label_ids, add_label_ids } = action

    const wcomponents: WComponent[] = get_wcomponents_from_state(state, wcomponent_ids)
        .filter(is_defined)

    if (wcomponents.length)
    {
        wcomponents.forEach(wcomponent => {
            const wcomponent_with_change: WComponent = { ...wcomponent, ...change }

            const edited_wcomponent = modify_label_ids(wcomponent_with_change, remove_label_ids, add_label_ids)

            const tidied = tidy_wcomponent(edited_wcomponent)
            state = handle_upsert_wcomponent(state, tidied, false)
        })
    }

    return state
}



function modify_label_ids (wcomponent: WComponent, remove_label_ids: Set<string> | undefined, add_label_ids: Set<string> | undefined)
{
    let { label_ids } = wcomponent

    if (label_ids && remove_label_ids) {
        label_ids = label_ids.filter(id => !remove_label_ids.has(id))
    }

    if (add_label_ids) {
        const new_label_ids = label_ids || []
        const existing_ids = new Set(new_label_ids)

        Array.from(add_label_ids).forEach(id => {
            if (!existing_ids.has(id))
                new_label_ids.push(id)
        })

        label_ids = new_label_ids
    }

    return { ...wcomponent, label_ids }
}
