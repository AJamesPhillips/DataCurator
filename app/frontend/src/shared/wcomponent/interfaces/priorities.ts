import type { HasDateTime } from "../../uncertainty/uncertainty"
import type { WComponentBase } from "./wcomponent_base"



export interface GoalPrioritisationEntry
{
    effort: number
}



export interface PrioritisedGoalAttributes
{
    [id: string]: GoalPrioritisationEntry
}



export interface WComponentPrioritisation extends WComponentBase, HasDateTime
{
    type: "prioritisation"
    goals: PrioritisedGoalAttributes
    explanation: string
}
