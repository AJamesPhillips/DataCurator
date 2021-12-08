import type { DataAppRootState } from "./State"



export function load_local_data (): DataAppRootState
{
    const data = localStorage.getItem("x_data_app") || "{}"

    return {
        multidimensional_states: [],
        multidimensional_state_datas: [],
        ...JSON.parse(data)
    }
}



export function save_local_data (data: Partial<DataAppRootState>)
{
    data = { ...load_local_data(), ...data }

    localStorage.saveItem("x_data_app", JSON.stringify(data))
}
