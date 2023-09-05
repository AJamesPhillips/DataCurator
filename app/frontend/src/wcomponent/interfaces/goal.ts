import type { HasObjectives } from "./judgement"
import type { WComponentNodeBase } from "./wcomponent_base"


// // potential == you have no yet made a decision to prioritise / reject this goal.
// // prioritised == neither potential, active nor inactive
// // active == you are actively pursuing this goal
// export type GoalStatuses = "potential" | "prioritised" | "active" | GoalInactiveStatuses
// // completed == completed
// //
// // invalid == it does not make sense any more, i,e,. it does not make
// //    sense any more, e.g. you want to help company X but they are fine
// //    now so don't need any help
// //
// // rejected === it is not what you want to do, e.g. because it's actually
// //    not going to help, or because there are higher priorities
// export type GoalInactiveStatuses = "completed" | "invalid" | "rejected"


export interface WComponentNodeGoal extends WComponentNodeBase, HasObjectives
{
    type: "goal"
    // +++ 2022-01-09
    // Allow a goal to be contributing to (encompassed by) one or more actions or goals
    // --- 2022-01-09
    parent_goal_or_action_ids?: string[]
}
