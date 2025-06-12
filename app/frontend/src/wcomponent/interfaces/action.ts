import type { WComponentCalculations, WComponentNodeBase } from "./wcomponent_base"



export type ActionStatusType = "potential"
    | "in progress"
    | "paused"
    | "completed"
    | "failed"
    | "rejected"
// TODO deprecate this in favour of ACTION_VALUE_POSSIBILITY_ID?
export const action_statuses: ActionStatusType[] = [
    "potential",
    "in progress",
    "paused",
    "completed",
    "failed",
    "rejected",
]
export const action_statuses_set = new Set(action_statuses)


export interface WComponentNodeAction extends WComponentNodeBase, Partial<WComponentCalculations>
{
    type: "action"
    // Making this optional because some actions that occur and that we perform, are done without
    // a conscious goal.
    //
    // +++ 2022-01-09
    // Allow an action to be contributing to (encompassed by) one or more actions
    // +++ 2025-06-12
    // `goal` type components have been deprecated, so this is now only used for actions
    parent_goal_or_action_ids?: string[]

    todo_index?: number
    user_ids?: string[]

    // status?: ActionStatus
    reason_for_status: string

    depends_on_action_ids: string[]
}
