import type { Dispatch, Store } from "redux"
import { date2str } from "../../../shared/utils/date_helpers"
import { min_throttle } from "../../../utils/throttle"
import { ACTIONS } from "../../actions"

import type { RootState } from "../../State"
import type { UserInfoState } from "../../user_info/state"
import { get_specialised_state_to_save, needs_save } from "../utils/needs_save"
import { attempt_save } from "../utils/save_state"



let last_attempted_state_to_backup: RootState | undefined = undefined
export function periodically_backup_solid_data (store: Store<RootState>)
{
    const { dispatch } = store

    store.subscribe(() =>
    {
        const state = store.getState()

        const { storage_type } = state.sync
        if (storage_type !== "solid") return


        if (!needs_save(state, last_attempted_state_to_backup)) return

        last_attempted_state_to_backup = state


        const user_info: UserInfoState = { ...state.user_info }
        const datetime_str = date2str(new Date(), "yyyy-MM-dd_hh-mm-ss")
        user_info.solid_pod_URL += `/data_curator_backups/${datetime_str}`

        backup_throttled_save_state.throttled({ dispatch, state, user_info })
    })
}


const THROTTLE = 60000 * 5
const backup_throttled_save_state = min_throttle(save_state, THROTTLE)


interface SaveStateArgs
{
    dispatch: Dispatch
    state: RootState
    user_info: UserInfoState
}
export function save_state ({ dispatch, state, user_info }: SaveStateArgs)
{
    last_attempted_state_to_backup = state
    dispatch(ACTIONS.backup.update_backup_status({ status: "SAVING" }))

    const storage_type = state.sync.storage_type!
    const data = get_specialised_state_to_save(state)

    return attempt_save({ storage_type, data, user_info, dispatch, is_backup: true })
    .then(() =>
    {
        dispatch(ACTIONS.backup.update_backup_status({ status: "SAVED" }))

        prune_backups()
    })
    .catch(() =>
    {
        last_attempted_state_to_backup = undefined
    })
}



function prune_backups ()
{
    console.log("prune_backups")
}
