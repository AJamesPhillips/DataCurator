import type { Store } from "redux"

import type { RootState } from "./State"
import { conditionally_warn_unsaved_exit } from "./sync/utils/conditionally_warn_unsaved_exit"



export function setup_warning_of_unsaved_data_beforeunload (load_state_from_storage: boolean, store: Store<RootState>)
{
    //const in_development = window.location.hostname === "localhost"
    let last_unload_warning = performance.now()
    const development_warning_threshold_ms = 30 * 1000
    window.onbeforeunload = () =>
    {
        const state = store.getState()
        let warn = conditionally_warn_unsaved_exit(load_state_from_storage, state)

        if (warn) // && in_development)
        {
            const outside_threshold = (performance.now() - last_unload_warning) > development_warning_threshold_ms
            warn = outside_threshold
        }

        if (warn) last_unload_warning = performance.now()

        return warn
    }
}
