import type { User } from "@supabase/supabase-js"

import { pick } from "../../shared/utils/pick"
import { get_supabase } from "../../supabase/get_supabase"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../persistence/persistence_utils"
import { local_user } from "../sync/local/data"
import type { UserInfoState } from "./state"



export function user_info_persist (state: RootState)
{
    const to_persist = pick([
        // "bases",
        "has_signed_in_at_least_once",
        "chosen_base_id",
    ], state.user_info)

    persist_state_object("user_info", to_persist)
}



interface UserInfoStartingStateArgs
{
    load_state_from_storage: boolean
    storage_location: number | undefined
}
export function user_info_starting_state (args: UserInfoStartingStateArgs): UserInfoState
{
    const obj = get_persisted_state_object<UserInfoState>("user_info")
    // const user_name = ensure_user_name("")

    const hash_has = (str: string) => document.location.hash.includes(str)
    const need_to_handle_password_recovery = hash_has("type=recovery")

    const chosen_base_id = args.storage_location !== undefined ? args.storage_location : obj.chosen_base_id


    const user: User | undefined = args.load_state_from_storage
        ? (get_supabase().auth.user() || undefined)
        : local_user


    const state: UserInfoState = {
        has_signed_in_at_least_once: false,
        user,
        need_to_handle_password_recovery,
        users_by_id: undefined,
        bases_by_id: undefined,
        ...obj,
        chosen_base_id,
    }

    return state
}



// const get_anonymous_user_name = () => "Anonymous " + random_animal()
// export const ensure_user_name = (user_name: string = "") => (user_name).trim() || get_anonymous_user_name()
