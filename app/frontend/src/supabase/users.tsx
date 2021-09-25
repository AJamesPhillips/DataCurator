import { h } from "preact"

import type { SupabaseUsersById } from "./interfaces"



interface GetUserNameForDisplayArgs
{
    users_by_id: SupabaseUsersById
    current_user_id: string | undefined
    other_user_id: string
}
export function get_user_name_for_display (args: GetUserNameForDisplayArgs)
{
    const { users_by_id, current_user_id, other_user_id } = args

    let name = users_by_id[other_user_id]?.name || ""
    if (!current_user_id) name = name || "Someone"
    else name = current_user_id === other_user_id ? "me" : (name || "(someone else)")

    return <span title={other_user_id}>{name}</span>
}
