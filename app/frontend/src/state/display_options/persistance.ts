import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../utils/persistence_utils"
import type { DisplayOptionsState } from "./state"
import { derive_validity_filter, derive_validity_formatting } from "./util"



export function display_options_persist (state: RootState)
{
    const to_persist = pick([
        "consumption_formatting",
        "time_resolution",
        "validity_filter",
        "validity_formatting",
    ], state.display_options)

    persist_state_object("display_options", to_persist)
}



export function display_options_starting_state (): DisplayOptionsState
{
    const obj = get_persisted_state_object<DisplayOptionsState>("display_options")
    const validity_filter = obj.validity_filter || "show_invalid"
    const validity_formatting = obj.validity_formatting || "render_certainty_as_opacity"
    const derived_validity_filter = derive_validity_filter(validity_filter)
    const derived_validity_formatting = derive_validity_formatting(validity_formatting)

    const state: DisplayOptionsState = {
        consumption_formatting: false,
        time_resolution: "hour",

        validity_filter,
        validity_formatting,
        derived_validity_filter,
        derived_validity_formatting,

        canvas_bounding_rect: undefined,
        ...obj,
    }

    return {
        ...state,
    }
}
