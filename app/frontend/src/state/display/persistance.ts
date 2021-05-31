import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../utils/persistence_utils"
import type { DisplayState } from "./state"



export function display_persist (state: RootState)
{
    const to_persist = pick(["consumption_formatting", "time_resolution"], state.display)

    persist_state_object("display", to_persist)
}



export function display_starting_state (): DisplayState
{
    const obj = get_persisted_state_object<DisplayState>("display")

    return {
        last_toggle_consumption_formatting_time_stamp: undefined,
        consumption_formatting: false,
        canvas_bounding_rect: undefined,
        time_resolution: "hour",
        ...obj,
    }
}
