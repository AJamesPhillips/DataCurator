import { date2str_auto } from "datacurator-core/utils/date_helpers"



export function floor_mseconds_to_minute_resolution (ms: number): number
{
    const date_str = date2str_auto({ date: new Date(ms), time_resolution: "minute" })

    return new Date(date_str).getTime()
}


/**
 * @deprecated can be replaced simply with `new Date()` now that we have
 * removed the creation context
 */
export function get_new_created_ats()
{
    const created_at = new Date()

    return { created_at, custom_created_at: undefined }
}
