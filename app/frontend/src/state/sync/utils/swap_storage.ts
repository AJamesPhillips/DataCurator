import type { Dispatch } from "redux"

import { ACTIONS } from "../../actions"
import type { RootState } from "../../State"
import { get_state_data } from "./load_state"
import { attempt_save } from "./save_state"



export async function swap_storage_type (dispatch: Dispatch, state: RootState)
{

    const { storage_type, copy_from_storage_type } = state.sync

    if (!copy_from_storage_type) return
    if (!storage_type)
    {
        const error_message = `Unable to copy data from: ${copy_from_storage_type} as no destination set.`
        dispatch(ACTIONS.sync.update_sync_status({ status: "FAILED", error_message }))
        return Promise.reject()
    }

    console .log(`swap_storage_type from ${copy_from_storage_type} to ${storage_type}`)


    dispatch(ACTIONS.sync.update_sync_status({ status: "OVERWRITING" }))

    const data = await get_state_data(copy_from_storage_type, state)

    if (!data)
    {
        const error_message = `Unable to get data from: ${copy_from_storage_type}`
        dispatch(ACTIONS.sync.update_sync_status({ status: "FAILED", error_message }))
        return Promise.reject()
    }

    console .log(`swap_storage_type got data, saving to: ${storage_type}`, data)

    await attempt_save({ storage_type, data, user_info: state.user_info, dispatch })

    console .log(`swap_storage_type finished copying data`)

    dispatch(ACTIONS.sync.clear_storage_type_copy_from({}))

    return
}
