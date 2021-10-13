import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../persistence/persistence_utils"
import type { DisplayOptionsState } from "./state"
import { derive_validity_filter, derive_certainty_formatting } from "./util"



export function display_options_persist (state: RootState)
{
    const to_persist = pick([
        "consumption_formatting",
        "time_resolution",
        "display_by_simulated_time",
        // "display_time_marks",
        "validity_filter",
        "certainty_formatting",
        "collapsed_side_panel",
    ], state.display_options)

    persist_state_object("display_options", to_persist)
}



export function display_options_starting_state (): DisplayOptionsState
{
    const obj = get_persisted_state_object<DisplayOptionsState>("display_options")
    const validity_filter = obj.validity_filter || "show_invalid"
    const certainty_formatting = obj.certainty_formatting || "render_certainty_as_opacity"
    const derived_validity_filter = derive_validity_filter(validity_filter)
    const derived_certainty_formatting = derive_certainty_formatting(certainty_formatting)

    const state: DisplayOptionsState = {
        consumption_formatting: true,
        focused_mode: false,
        time_resolution: "hour",
        display_by_simulated_time: false,
        display_time_marks: false,
        collapsed_side_panel: false,
        show_help_menu: false,

        validity_filter,
        certainty_formatting,
        derived_validity_filter,
        derived_certainty_formatting,

        ...obj,
    }

    return state
}
