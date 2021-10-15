import type { DatetimeLineConfig } from "../shared/interfaces/knowledge_view"



interface DefaultDatetimeLineConfig extends DatetimeLineConfig
{
    time_origin_x: number
    time_scale: number
    time_line_number: number
    time_line_spacing_days: number
}

export const DEFAULT_DATETIME_LINE_CONFIG: DefaultDatetimeLineConfig = {
    time_origin_x: 0,
    time_scale: 1,
    time_line_number: 4,
    time_line_spacing_days: 30,
}
