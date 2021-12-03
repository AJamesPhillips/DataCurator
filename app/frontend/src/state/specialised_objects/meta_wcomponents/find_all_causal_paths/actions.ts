import type { Action, AnyAction } from "redux"



interface SetFindAllCausalPathsWcomponentIdsProps
{
    direction: "from" | "to"
    ids: string[]
}
export interface ActionSetFindAllCausalPathsWcomponentIds extends Action, SetFindAllCausalPathsWcomponentIdsProps {}

const set_find_all_causal_paths_wcomponent_ids_type = "set_find_all_causal_paths_wcomponent_ids"

const set_find_all_causal_paths_wcomponent_ids = (args: SetFindAllCausalPathsWcomponentIdsProps): ActionSetFindAllCausalPathsWcomponentIds =>
{
    return { type: set_find_all_causal_paths_wcomponent_ids_type, ...args }
}

export const is_set_find_all_causal_paths_wcomponent_ids = (action: AnyAction): action is ActionSetFindAllCausalPathsWcomponentIds => {
    return action.type === set_find_all_causal_paths_wcomponent_ids_type
}



export const find_all_causal_paths_actions = {
    set_find_all_causal_paths_wcomponent_ids,
}
