

const MSECONDS_PER_HOUR = 3600000
export function floor_datetime (date: Date, resolution: "hour")
{
    return new Date(Math.floor(date.getTime() / MSECONDS_PER_HOUR) * MSECONDS_PER_HOUR)
}