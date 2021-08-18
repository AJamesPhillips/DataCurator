import type { Store } from "redux"

import type { RootState } from "../State"
import { optionally_copy_then_load_data } from "./utils/optionally_copy_then_load_data"



export function sync_subscribers (store: Store<RootState>)
{
    store.subscribe(export_data_on_changing_storage_type(store))

}


function export_data_on_changing_storage_type (store: Store<RootState>)
{
    let { storage_type: last_storage_type } = store.getState().sync

    return () =>
    {
        const { storage_type: current_storage_type } = store.getState().sync

        if (last_storage_type === current_storage_type) return
        last_storage_type = current_storage_type

        optionally_copy_then_load_data(store)
    }
}
