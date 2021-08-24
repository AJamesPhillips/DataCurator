import {
    getContainedResourceUrlAll,
    getSolidDataset,
    deleteSolidDataset,
    isContainer,
} from "@inrupt/solid-client"
import { fetch as solid_fetch } from "@inrupt/solid-client-authn-browser"
import type { Dispatch, Store } from "redux"
import { date2str } from "../../../shared/utils/date_helpers"
import { sort_list } from "../../../shared/utils/sort"
import { min_throttle } from "../../../utils/throttle"
import { ACTIONS } from "../../actions"

import type { RootState } from "../../State"
import type { UserInfoState } from "../../user_info/state"
import { get_specialised_state_to_save, needs_save } from "../utils/needs_save"
import { attempt_save } from "../utils/save_state"



const BACKUPS_PATH = "/data_curator_backups"


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
        const original_solid_pod_URL = user_info.default_solid_pod_URL
        user_info.default_solid_pod_URL += `${BACKUPS_PATH}/${datetime_str}`

        backup_throttled_save_state.throttled({ dispatch, state, user_info, original_solid_pod_URL })
    })
}


const BACKUP_THROTTLE_MS = 60000 * 5
const backup_throttled_save_state = min_throttle(save_state, BACKUP_THROTTLE_MS)


interface SaveStateArgs
{
    dispatch: Dispatch
    state: RootState
    user_info: UserInfoState
    original_solid_pod_URL: string
}
export function save_state ({ dispatch, state, user_info, original_solid_pod_URL }: SaveStateArgs)
{
    last_attempted_state_to_backup = state
    dispatch(ACTIONS.backup.update_backup_status({ status: "SAVING" }))

    const storage_type = state.sync.storage_type!
    const data = get_specialised_state_to_save(state)

    return attempt_save({ storage_type, data, user_info, dispatch, is_backup: true })
    .then(() =>
    {
        dispatch(ACTIONS.backup.update_backup_status({ status: "SAVED" }))

        prune_backups(original_solid_pod_URL, user_info)
    })
    .catch(() =>
    {
        last_attempted_state_to_backup = undefined
    })
}



const MAX_BACKUPS = 50
async function prune_backups (original_solid_pod_URL: string, user_info: UserInfoState)
{
    console.group("prune_backups")
    try
    {
        const backups = await getSolidDataset(original_solid_pod_URL + BACKUPS_PATH, { fetch: solid_fetch })
        const urls = await getContainedResourceUrlAll(backups)
        if (urls.length > MAX_BACKUPS)
        {
            const sorted_urls = sort_list(urls, u => u, "descending")
            const excess_urls = sorted_urls.slice(MAX_BACKUPS)
            await remove_solid_datasets(excess_urls)
        }

        console.groupEnd()
    }
    catch (err)
    {
        console.error("Error pruning backups: ", err)
    }
}



async function remove_solid_datasets (urls: string[])
{
    console .log(`+Aiming to delete ${urls.length} solid containers: ` + urls)

    for (let i = 0; i < urls.length; ++i)
    {
        const url = urls[i]!
        console .log("+Deleting solid container: " + url)

        const dataset = await getSolidDataset(url, { fetch: solid_fetch })
        if (isContainer(dataset))
        {
            const sub_urls = await getContainedResourceUrlAll(dataset)
            await remove_solid_datasets(sub_urls)
        }

        await deleteSolidDataset(url, { fetch: solid_fetch })
        console .log("-Deleted solid container: " + url)
    }
}
