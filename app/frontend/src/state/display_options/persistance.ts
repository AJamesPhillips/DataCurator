import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../persistence/persistence_utils"
import type { DisplayOptionsState } from "./state"
import { derive_certainty_formatting, derive_validity_filter } from "./util"



export function display_options_persist (state: RootState)
{
    const to_persist = pick([
        "consumption_formatting",
        "time_resolution",
        "display_by_simulated_time",
        "display_time_marks",
        "animate_connections",
        "circular_links",
        "show_large_grid",
        "validity_filter",
        "certainty_formatting",
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
        time_resolution: "minute",
        display_by_simulated_time: false,
        display_time_marks: false,
        animate_connections: false,
        circular_links: true,
        show_help_menu: false,
        show_large_grid: false,

        validity_filter,
        certainty_formatting,
        derived_validity_filter,
        derived_certainty_formatting,

        ...obj,
    }

    if (!get_experimental_features_state().enable_align_components_on_x_by_time)
    {
        state.display_time_marks = false
    }

    return state
}


interface ExperimentalFeaturesState
{
    enable_angular_connections: boolean
    enable_action_kanban_view: boolean
    enable_align_components_on_x_by_time: boolean
}
const get_experimental_features_state = (): ExperimentalFeaturesState =>
{
    const obj = get_persisted_state_object<ExperimentalFeaturesState>("experimental_features")
    return {
        enable_angular_connections: obj.enable_angular_connections ?? false,
        enable_action_kanban_view: obj.enable_action_kanban_view ?? false,
        enable_align_components_on_x_by_time: obj.enable_align_components_on_x_by_time ?? false,
    }
}
export const experimental_features = {
    get_state: get_experimental_features_state,
    set_state_and_reload_page: (state: Partial<ExperimentalFeaturesState>) =>
    {
        const current_state = get_experimental_features_state()
        const new_state = { ...current_state, ...state }
        persist_state_object("experimental_features", new_state)
        // reload the page to apply the changes
        document.location.reload()
    }
}
