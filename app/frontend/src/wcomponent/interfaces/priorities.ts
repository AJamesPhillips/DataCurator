import type { HasUncertainDatetime } from "../../shared/uncertainty/interfaces"
import type { WComponentBase } from "./wcomponent_base"



export interface GoalPrioritisationEntry
{
    effort: number
}



export interface PrioritisedGoalAttributes
{
    [id: string]: GoalPrioritisationEntry
}



export interface WComponentPrioritisation extends WComponentBase, HasUncertainDatetime
{
    type: "prioritisation"
    goals: PrioritisedGoalAttributes
}
