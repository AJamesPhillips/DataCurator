

export type TimeSliderEventType = "now" | "created" | "sim"

export interface TimeSliderEvent
{
    datetime: Date
    type: TimeSliderEventType
    label?: string
    color?: string
}


export interface TimeSliderData
{
    // earliest_ms: number
    // latest_ms: number
    created_events: TimeSliderEvent[]
    sim_events: TimeSliderEvent[]
}
