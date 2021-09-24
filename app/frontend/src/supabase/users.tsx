import { h } from "preact"
import type { User as SupabaseAuthUser } from "@supabase/supabase-js"

import type { SupabaseUsersById } from "./interfaces"



interface GetUserNameForDisplayArgs
{
    users_by_id: SupabaseUsersById
    user: SupabaseAuthUser
    other_user_id: string
}
export function get_user_name_for_display (args: GetUserNameForDisplayArgs)
{
    const { users_by_id, user, other_user_id } = args

    let name = users_by_id[other_user_id]?.name || ""
    if (!user) name = name || "Someone"
    else name = user.id === other_user_id ? (name ? name + " (You)" : "You") : (name || "(Someone else)")

    return <span title={other_user_id}>{name}</span>
}
