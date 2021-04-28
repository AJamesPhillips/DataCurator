import type { Action, AnyAction } from "redux"

import { update_substate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import type { RoutingStateArgs } from "../interfaces"
import { get_datetime_and_ms } from "./routing_datetime"



export const display_at_sim_datetime_reducer = (state: RootState, action: AnyAction): RootState =>
{
    if (is_change_display_at_sim_datetime(action))
    {
        const { ms, datetime } = get_datetime_and_ms(action)

        const args: RoutingStateArgs = {
            ...state.routing.args,
            sim_datetime: datetime,
            sim_ms: ms,
        }

        state = update_substate(state, "routing", "args", args)
    }

    return state
}


//
type UpdateCurrentDatetimeProps = { datetime: Date; ms?: undefined } | { ms: number; datetime?: undefined }
type ActionUpdateCurrentDatetime = Action & UpdateCurrentDatetimeProps

const change_display_at_sim_datetime_type = "change_display_at_sim_datetime"

const change_display_at_sim_datetime = (args: UpdateCurrentDatetimeProps): ActionUpdateCurrentDatetime =>
{
    return { type: change_display_at_sim_datetime_type, ...args }
}

const is_change_display_at_sim_datetime = (action: AnyAction): action is ActionUpdateCurrentDatetime => {
    return action.type === change_display_at_sim_datetime_type
}


export const display_at_sim_datetime_actions = {
    change_display_at_sim_datetime,
}
