import type { HasObjectives } from "./judgement"
import type { WComponentNodeBase } from "./wcomponent_base"



export type ActionStatusType = "potential"
    | "in progress"
    | "paused"
    | "completed"
    | "failed"
    | "rejected"
// TODO deprecate this in favour of ACTION_VALUE_POSSIBILITY_IDS?
export const action_statuses: ActionStatusType[] = [
    "potential",
    "in progress",
    "paused",
    "completed",
    "failed",
    "rejected",
]
export const action_statuses_set = new Set(action_statuses)


export interface WComponentNodeAction extends WComponentNodeBase, HasObjectives
{
    type: "action"
    // +++ 2021-05-24
    // Commented out outcome_ids -> VAP ids because:
    //   * It can be recorded using the `description` field
    //   * It should be possible to capture using casual links
    // --- 2021-05-24
    // outcome_ids: string[] // VAP ids

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
