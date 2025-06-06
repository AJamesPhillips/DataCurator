import type { WComponentNodeBase } from "./wcomponent_base"


export interface StartedStoppedAt
{
    // started_at and stopped_at are not necessary if WComponentBase or Base are versioned
    started_at?: Date
    stopped_at?: Date
}



export type ActionStatusType = "potential"
    | "in progress"
    | "paused"
    | "completed"
    | "failed"
    | "rejected"
export const action_statuses: ActionStatusType[] = [
    "potential",
    "in progress",
    "paused",
    "completed",
    "failed",
    "rejected",
]
export const action_statuses_set = new Set(action_statuses)


export interface WComponentNodeAction extends WComponentNodeBase, StartedStoppedAt
{
    type: "action"
    // Making this optional because some actions that occur and that we perform, are done without
    // a conscious goal.
    //
    // +++ 2021-05-24
    // If the action has a status of potential and the goal can have any status and
    // be sensible (correct?)
    // If the action has a status !== potential and the goal has a status of potential
    // then this likely inconsistent but not that important?
    // --- 2021-05-24
    goal_id?: string

    // status?: ActionStatus
    reason_for_status: string

    encompassing_action_id?: string
    depends_on_action_ids: string[]
}
