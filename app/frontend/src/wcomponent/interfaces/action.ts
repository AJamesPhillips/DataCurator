import type { HasObjectives } from "./judgement"
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


export interface WComponentNodeAction extends WComponentNodeBase, HasObjectives, Partial<WComponentCalculations>
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
    //
    // +++ 2022-01-09
    // Allow an action to be contributing to (encompassed by) one or more actions or goals
    // --- 2022-01-09
    parent_goal_or_action_ids?: string[]

    todo_index?: number
    user_ids?: string[]

    // status?: ActionStatus
    reason_for_status: string

    depends_on_action_ids: string[]

    // 2024-05-03  Exploring adding calculations to action component to allow for
    // simulations to be "self documenting".
    // I don't think it needs to have subtype or units as one action can have
    // multiple calculations and assign outputs back to multiple other states
    // with different subtypes and units.
    // `calculations?: PlainCalculationObject[]` is add by `Partial<WComponentCalculations>`
}
