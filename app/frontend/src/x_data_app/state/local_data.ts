import { get_starting_state } from "./starting_state"
import type { DataAppRootState } from "./State"



export function load_local_data (): DataAppRootState
{
    const data = localStorage.getItem("x_data_app") || "{}"

    return {
        ...get_starting_state(false),
        ...JSON.parse(data),
    }
}



export function save_local_data (data: Partial<DataAppRootState>)
{
    data = { ...load_local_data(), ...data }

    localStorage.saveItem("x_data_app", JSON.stringify(data))
}
