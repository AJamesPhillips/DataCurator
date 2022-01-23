import type { User as SupabaseAuthUser } from "@supabase/supabase-js"

import type { SupabaseKnowledgeBaseWithAccessById, SupabaseUsersById } from "../../supabase/interfaces"



export interface UserInfoState
{
    has_signed_in_at_least_once: boolean  // Currently this gets cleared on signout
    user: SupabaseAuthUser | undefined
    need_to_handle_password_recovery: boolean
    users_by_id: SupabaseUsersById | undefined
    chosen_base_id: number | undefined
    bases_by_id: SupabaseKnowledgeBaseWithAccessById | undefined
}
