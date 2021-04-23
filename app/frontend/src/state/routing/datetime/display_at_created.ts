import type { Action, AnyAction, Store } from "redux"
import { update_substate } from "../../../utils/update_state"

import type { RootState } from "../../State"



export const display_at_created_datetime_reducer = (state: RootState, action: AnyAction): RootState =>
{
    if (is_change_display_at_created_datetime(action))
    {
        const datetime = action.datetime || new Date(action.ms)
        const ms = action.ms !== undefined ? action.ms : action.datetime.getTime()

        const args = {
            ...state.routing.args,
            created_at_datetime: datetime,
            created_at_ms: ms,
        }
        state = update_substate(state, "routing", "args", args)
    }

    return state
}


//
type UpdateCurrentDatetimeProps = { datetime: Date; ms?: undefined } | { ms: number; datetime?: undefined }
type ActionUpdateCurrentDatetime = Action & UpdateCurrentDatetimeProps

const change_display_at_created_datetime_type = "change_display_at_created_datetime"

const change_display_at_created_datetime = (args: UpdateCurrentDatetimeProps): ActionUpdateCurrentDatetime =>
{
    return { type: change_display_at_created_datetime_type, ...args }
}

const is_change_display_at_created_datetime = (action: AnyAction): action is ActionUpdateCurrentDatetime => {
    return action.type === change_display_at_created_datetime_type
}


export const display_at_created_datetime_actions = {
    change_display_at_created_datetime,
}


//

const one_hour = 3600 * 1000
export function periodically_change_display_at_created_datetime (store: Store<RootState>)
{
    setTimeout(() => {
        store.dispatch(change_display_at_created_datetime({ datetime: new Date() }))
    }, one_hour)
}
