import type { Action, AnyAction } from "redux"

import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"
import type { SearchFields, SearchType } from "./state"

export const search_reducer = (state: RootState, action: AnyAction): RootState =>
{
    if (is_update_search_fields(action))
    {
        state = update_substate(state, "search", "search_fields", action.search_fields)
    }

    if (is_update_search_type(action))
    {
        state = update_substate(state, "search", "search_type", action.search_type)
    }
    return state
}

interface UpdateSearchFieldsArgs
{
    search_fields: SearchFields
}

interface UpdateSearchTypeArgs
{
    search_type: SearchType
}

interface ActionUpdateSearchFields extends Action, UpdateSearchFieldsArgs {}
interface ActionUpdateSearchType extends Action, UpdateSearchTypeArgs {}

const update_search_fields_type = "update_search_fields"
const update_search_type_type = "update_search_type"

export const update_search_fields = (args: UpdateSearchFieldsArgs): ActionUpdateSearchFields =>
{
    return { type: update_search_fields_type, ...args }
}

const is_update_search_fields = (action: AnyAction): action is ActionUpdateSearchFields => {
    return action.type === update_search_fields_type
}

export const update_search_type = (args: UpdateSearchTypeArgs): ActionUpdateSearchType =>
{
    return { type: update_search_fields_type, ...args }
}

const is_update_search_type = (action: AnyAction): action is ActionUpdateSearchType => {
    return action.type === update_search_type_type
}

export const search_actions = {
    update_search_fields,
    update_search_type,
}
