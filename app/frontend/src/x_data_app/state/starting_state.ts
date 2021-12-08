import type { DataAppRootState } from "./State"



export function get_starting_state (load_state_from_storage: boolean): DataAppRootState
{
    return {
        multidimensional_states: [],
        multidimensional_state_datas: [],
    }
}
