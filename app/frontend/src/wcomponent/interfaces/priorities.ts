import type { HasUncertainDatetime } from "../../shared/uncertainty/interfaces"
import type { WComponentBase } from "./wcomponent_base"



export interface GoalOrActionPrioritisationEntry
{
    effort: number
}



export interface PrioritisedGoalOrActionAttributes
{
    [goal_or_action_id: string]: GoalOrActionPrioritisationEntry
}



export interface WComponentPrioritisation extends WComponentBase, HasUncertainDatetime
{
    type: "prioritisation"
    goals: PrioritisedGoalOrActionAttributes
}
