import type { CanvasPoint } from "../canvas/interfaces";


export type ObjectiveType = "value" | "process" | "state" | "event"


interface CoreOfObjective
{
    id: string
    created_at: Date
    type: ObjectiveType
    title: string
    caused_by: string[]
}

interface ViewsOntoObjective
{
    main: {
        preceeding_id: string,
    }
}

export interface Objective extends CoreOfObjective, ViewsOntoObjective {}

export interface ObjectiveNodeProps extends Objective
{
    vertical_ordinal: number
}

export interface ObjectiveConnection
{
    from_id: string
    from_ms: number
    from_vertical_ordinal: number
    to_id: string
    to_ms: number
    to_vertical_ordinal: number
}
