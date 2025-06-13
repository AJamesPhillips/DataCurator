import { TimeResolution } from "datacurator-core/interfaces/datetime"


export interface DisplayOptionsState
{
    consumption_formatting: boolean
    focused_mode: boolean
    time_resolution: TimeResolution
    display_time_marks: boolean
    animate_connections: boolean
    circular_links: boolean
    show_help_menu: boolean
    show_large_grid: boolean
}


const _time_resolution_types: {[P in TimeResolution]: true} = {
    second: true,
    minute: true,
    hour: true,
    day: true,
}
export const time_resolution_types = Object.keys(_time_resolution_types) as TimeResolution[]
