import { round_coordinate_small_step } from "../canvas/position_utils"
import { time_scale_days_to_ms_pixels_fudge_factor } from "../shared/constants"
import type { DefaultDatetimeLineConfig } from "../shared/interfaces/datetime_lines"
import { get_current_datetime_from_wcomponent } from "../state/specialised_objects/accessors"
import type { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"



export const DEFAULT_DATETIME_LINE_CONFIG: DefaultDatetimeLineConfig = {
    time_origin_x: 0,
    time_scale: 1,
    time_line_number: 4,
    time_line_spacing_days: 30,
}

export function default_time_origin_parameters (args: { time_origin_ms: number | undefined, time_origin_x: number | undefined, time_scale: number | undefined })
{
    const time_origin_ms = args.time_origin_ms ?? new Date().getTime()
    const time_origin_x = args.time_origin_x ?? 0
    const time_scale = args.time_scale ?? 1

    return { time_origin_ms, time_origin_x, time_scale }
}



interface CalculateCanvasXForWcomponentSingleDatetimeArgs
{
    wcomponent_id: string
    wcomponents_by_id: WComponentsById
    created_at_ms: number
    time_origin_ms: number
    time_origin_x: number
    time_scale: number
}
export function calculate_canvas_x_for_wcomponent_temporal_uncertainty (args: CalculateCanvasXForWcomponentSingleDatetimeArgs): number | undefined
{
    const datetime = get_current_datetime_from_wcomponent(args.wcomponent_id, args.wcomponents_by_id, args.created_at_ms)
    if (!datetime) return undefined


    const left = calculate_canvas_x_for_datetime({
        datetime,
        ...args,
    })

    return round_coordinate_small_step(left)
}



interface CalculateCanvasXArgs
{
    datetime: Date
    time_origin_ms: number
    time_origin_x: number
    time_scale: number
}
export function calculate_canvas_x_for_datetime (args: CalculateCanvasXArgs)
{
    const time_diff = args.datetime.getTime() - args.time_origin_ms
    const time_scalar = args.time_scale / time_scale_days_to_ms_pixels_fudge_factor

    return (time_diff * time_scalar) + args.time_origin_x
}
