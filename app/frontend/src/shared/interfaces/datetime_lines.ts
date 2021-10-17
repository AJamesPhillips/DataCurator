

// TODO should move this to it's own top level directory like datetime_lines ?
export interface DatetimeLineConfig
{
    time_origin_ms?: number
    time_origin_x?: number
    time_scale?: number
    time_line_number?: number
    time_line_spacing_days?: number
}


export interface DefaultDatetimeLineConfig extends DatetimeLineConfig
{
    time_origin_x: number
    time_scale: number
    time_line_number: number
    time_line_spacing_days: number
}


export type ComposedDatetimeLineConfig = DatetimeLineConfig & DefaultDatetimeLineConfig
