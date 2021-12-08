import type { Reducer } from "preact/hooks"
import type { AnyAction } from "redux"

import type { DataAppRootState } from "./State"



export const root_reducer: Reducer<DataAppRootState, any> = (state: DataAppRootState, action: AnyAction) =>
{
    return state
}
