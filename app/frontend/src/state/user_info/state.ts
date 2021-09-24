import type { User as SupabaseAuthUser } from "@supabase/supabase-js"

import type { SupabaseKnowledgeBaseWithAccess, SupabaseUsersById } from "../../supabase/interfaces"



export interface UserInfoState
{
    user: SupabaseAuthUser | null
    need_to_handle_password_recovery: boolean
    users_by_id: SupabaseUsersById | undefined
    user_name: string | undefined
    chosen_base_id: number | undefined
    bases: SupabaseKnowledgeBaseWithAccess[] | undefined
}
