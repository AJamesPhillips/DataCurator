import type { NodeField } from "../canvas/interfaces"


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
    earliest_ms: number
    latest_ms: number
}


export interface ProjectPrioritiesByProjectId
{
    [ project_id: string ]: {
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
