


export interface TimeSliderEvent
{
    start_date: Date
}


export interface TimeSliderData
{
    // earliest_ms: number
    // latest_ms: number
    events: TimeSliderEvent[]
}


export interface TimeSliderV2Event
{
    datetime: Date
    label: string
    color: string
}
