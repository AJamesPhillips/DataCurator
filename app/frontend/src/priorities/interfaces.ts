import type { NodeField } from "../canvas/interfaces"
import type { TimeSliderEvent } from "../time_control/interfaces"


export interface ProjectPriority
{
    id: string
    start_date: Date
    name: string
    project_id: string
    fields: NodeField[]
}


export interface ProjectPrioritiesMeta
{
    project_priorities: ProjectPriority[]
    priorities_by_project: ProjectPrioritiesByProjectId
    project_id_to_vertical_position: ProjectIdToVerticalPosition
    project_priority_events: TimeSliderEvent[]
    earliest_ms: number
    latest_ms: number
}


export interface ProjectPrioritiesByProjectId
{
    [ goal_or_action_id: string ]: {
        project_priorities: ProjectPriority[]
        vertical_position: number
    }
}


//

export interface DailyAction
{
    action_ids: string[]
}

export interface DailyActionsMeta
{
    [ project_id: string ]: {
        [ date: string ]: DailyAction
    }
}


//

export interface ProjectIdToVerticalPosition
{
    [ project_id: string ]: number
}
