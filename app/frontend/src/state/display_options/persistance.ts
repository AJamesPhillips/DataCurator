import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../utils/persistence_utils"
import type { DisplayOptionsState } from "./state"



export function display_options_persist (state: RootState)
{
    const to_persist = pick(["consumption_formatting", "time_resolution", "validity_to_certainty"], state.display_options)

    persist_state_object("display_options", to_persist)
}



export function display_options_starting_state (): DisplayOptionsState
{
    const obj = get_persisted_state_object<DisplayOptionsState>("display_options")

    return {
        consumption_formatting: false,
        time_resolution: "hour",

        validity_to_certainty: "show_invalid",

        canvas_bounding_rect: undefined,
        ...obj,
    }
}
