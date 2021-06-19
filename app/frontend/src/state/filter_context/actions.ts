import type { Action, AnyAction } from "redux"
import type { CompoundFilter } from "./state"



interface ActionSetApplyFilter extends Action
{
    apply_filter: boolean
}

const set_apply_filter_type = "set_apply_filter"

const set_apply_filter = (apply_filter: boolean): ActionSetApplyFilter =>
{
    return { type: set_apply_filter_type, apply_filter }
}

export const is_set_apply_filter = (action: AnyAction): action is ActionSetApplyFilter => {
    return action.type === set_apply_filter_type
}



interface SetFiltersArgs
{
    filters: CompoundFilter[]
}
interface ActionSetFilters extends Action, SetFiltersArgs {}

const set_filters_type = "set_filters"

const set_filters = (args: SetFiltersArgs): ActionSetFilters =>
{
    return { type: set_filters_type, ...args }
}

export const is_set_filters = (action: AnyAction): action is ActionSetFilters => {
    return action.type === set_filters_type
}



export const filter_context_actions = {
    set_apply_filter,
    set_filters,
}
