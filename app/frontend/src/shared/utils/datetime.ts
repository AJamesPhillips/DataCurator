import { TimeResolution } from "datacurator-core/interfaces/datetime"

import { date2str_auto } from "./date_helpers"



export function floor_mseconds_to_resolution (ms: number, time_resolution: TimeResolution): number
{
    const date = floor_datetime_to_resolution(new Date(ms), time_resolution)

    return date.getTime()
}



export function floor_datetime_to_resolution (date: Date, time_resolution: TimeResolution)
{
    const str = date2str_auto({ date, time_resolution })

    return new Date(str)
}



export function get_new_created_ats()
{
    const created_at = new Date()

    return { created_at, custom_created_at: undefined }
}
