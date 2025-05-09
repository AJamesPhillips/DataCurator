import type { AnyAction, Reducer } from "redux"

import type { DataAppRootState } from "./State"



export const factory_root_reducer = (initial_state: DataAppRootState): Reducer<DataAppRootState, any> => (state: DataAppRootState | undefined, action: AnyAction) =>
{
    return state || initial_state
}
