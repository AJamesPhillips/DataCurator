import { TimeResolution } from "datacurator-core/interfaces/datetime"
// import type { Certainty } from "../../shared/uncertainty/quantified_language"



// export type ValidityToCertainty = {[k in Certainty] : ValidityDisplayOptions }
// interface ValidityDisplayOptions
// {
//     display: boolean
//     opacity: number
// }

export type ValidityFilterTypes = "only_certain_valid" | "only_maybe_valid" | "maybe_invalid" | "show_invalid"
export type ValidityFilterOption = {[type in ValidityFilterTypes]: boolean}

export type CertaintyFormattingTypes = "render_certainty_as_opacity" | "render_certainty_as_easier_opacity" | "render_100_opacity"
export type CertaintyFormattingOption = {[type in CertaintyFormattingTypes]: boolean}
// export type ValidityToCertainty_TypeToMap = {[k in ValidityToCertaintyTypes] : ValidityToCertainty }


export interface DisplayOptionsState
{
    consumption_formatting: boolean
    focused_mode: boolean
    time_resolution: TimeResolution
    display_by_simulated_time: boolean
    display_time_marks: boolean
    animate_connections: boolean
    circular_links: boolean
    show_help_menu: boolean
    show_large_grid: boolean

    // Validity
    validity_filter: ValidityFilterTypes
    certainty_formatting: CertaintyFormattingTypes
    derived_validity_filter: ValidityFilterOption
    derived_certainty_formatting: CertaintyFormattingOption
}


const _time_resolution_types: {[P in TimeResolution]: true} = {
    second: true,
    minute: true,
    hour: true,
    day: true,
}
export const time_resolution_types = Object.keys(_time_resolution_types) as TimeResolution[]
