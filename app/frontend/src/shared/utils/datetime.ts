import type { CreationContextState } from "../interfaces"



export type TimeResolution = "minute" | "hour" | "day"


const MSECONDS_PER_MINUTE = 60000
const MSECONDS_PER_HOUR = 60 * MSECONDS_PER_MINUTE
const MSECONDS_PER_DAY = MSECONDS_PER_HOUR * 24

function time_resolution_to_factor (time_resolution: TimeResolution): number
{
    let factor = MSECONDS_PER_MINUTE
    if (time_resolution === "hour") factor = MSECONDS_PER_HOUR
    else if (time_resolution === "day") factor = MSECONDS_PER_DAY

    return factor
}



export function floor_mseconds_to_resolution (ms: number, time_resolution: TimeResolution): number
{
    const factor = time_resolution_to_factor(time_resolution)

    return Math.floor(ms / factor) * factor
}



export function floor_datetime_to_resolution (date: Date, time_resolution: TimeResolution)
{
    return new Date(floor_mseconds_to_resolution(date.getTime(), time_resolution))
}



interface GetCreatedAtsReturn
{
    created_at: Date
    custom_created_at: Date | undefined
}
export function get_created_ats (creation_context_state: CreationContextState): GetCreatedAtsReturn
{
    const created_at = new Date()

    const { use_creation_context, creation_context } = creation_context_state
    const custom_created_at = use_creation_context ? creation_context.custom_created_at : undefined

    return { created_at, custom_created_at }
}
