import type { Action, AnyAction } from "redux"

import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"
import type { SearchFields } from "./state"



export const search_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_update_search_fields(action))
    {
        state = update_substate(state, "search", "search_fields", action.search_fields)
    }


    return state
}



interface UpdateSearchFieldsArgs
{
    search_fields: SearchFields
}

interface ActionUpdateSearchFields extends Action, UpdateSearchFieldsArgs {}

const update_search_fields_type = "update_search_fields"

export const update_search_fields = (args: UpdateSearchFieldsArgs): ActionUpdateSearchFields =>
{
    return { type: update_search_fields_type, ...args }
}

const is_update_search_fields = (action: AnyAction): action is ActionUpdateSearchFields => {
    return action.type === update_search_fields_type
}



export const search_actions = {
    update_search_fields,
}
