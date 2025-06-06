
export interface GoalOrActionPrioritisationEntry
{
    effort: number
}



export interface PrioritisedGoalOrActionAttributes
{
    [goal_or_action_id: string]: GoalOrActionPrioritisationEntry
}
