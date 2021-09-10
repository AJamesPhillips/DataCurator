import type { HasUncertainDateTime } from "../../uncertainty/uncertainty"
import type { WComponentBase } from "./wcomponent_base"



export interface GoalPrioritisationEntry
{
    effort: number
}



export interface PrioritisedGoalAttributes
{
    [id: string]: GoalPrioritisationEntry
}



export interface WComponentPrioritisation extends WComponentBase, HasUncertainDateTime
{
    type: "prioritisation"
    goals: PrioritisedGoalAttributes
}
