import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../persistence/persistence_utils"
import type { UserInfoState } from "./state"
import { random_animal } from "../../utils/list_of_animals"
import { get_supabase } from "../../supabase/get_supabase"



export function user_info_persist (state: RootState)
{
    const to_persist = pick([
        // "bases",
        "chosen_base_id",
    ], state.user_info)

    persist_state_object("user_info", to_persist)
}



export function user_info_starting_state (storage_location: number | undefined): UserInfoState
{
    const obj = get_persisted_state_object<UserInfoState>("user_info")
    // const user_name = ensure_user_name("")
    const need_to_handle_password_recovery = document.location.hash.includes("type=recovery")
    const chosen_base_id = storage_location !== undefined ? storage_location : obj.chosen_base_id

    let state: UserInfoState = {
        user: get_supabase().auth.user(),
        need_to_handle_password_recovery,
        users_by_id: undefined,
        bases: undefined,
        ...obj,
        user_name: "",
        chosen_base_id,
    }

    return state
}



const get_anonymous_user_name = () => "Anonymous " + random_animal()
export const ensure_user_name = (user_name: string = "") => (user_name).trim() || get_anonymous_user_name()
