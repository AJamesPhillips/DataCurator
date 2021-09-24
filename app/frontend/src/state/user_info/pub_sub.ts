import type { User as SupabaseAuthUser } from "@supabase/supabase-js"
import type { SupabaseUsersById } from "../../supabase/interfaces"
import { pub_sub_factory } from "../pub_sub/pub_sub_factory"



interface UserMsgMap
{
    changed_user: SupabaseAuthUser | null
    changed_users_by_id: SupabaseUsersById | undefined
}

export const user_pub_sub = pub_sub_factory<UserMsgMap>()
