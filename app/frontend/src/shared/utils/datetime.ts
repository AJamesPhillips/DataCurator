

const MSECONDS_PER_HOUR = 3600000
const MSECONDS_PER_DAY = MSECONDS_PER_HOUR * 24
export function floor_datetime (date: Date, resolution: "hour" | "day")
{
    let factor = MSECONDS_PER_HOUR
    if (resolution === "day") factor = MSECONDS_PER_DAY

    return new Date(Math.floor(date.getTime() / factor) * factor)
}



export function get_created_ats (): { created_at: Date, custom_created_at: Date | undefined }
{
    const created_at = new Date()
    const custom_created_at = undefined

    return { created_at, custom_created_at }
}
