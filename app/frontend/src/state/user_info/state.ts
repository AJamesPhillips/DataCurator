import type { User as SupabaseAuthUser } from "@supabase/supabase-js"

import type { SupabaseKnowledgeBaseWithAccessById, SupabaseUsersById } from "../../supabase/interfaces"



export interface UserInfoState
{
    has_signed_in_at_least_once: boolean  // Currently this gets cleared on signout
    user: SupabaseAuthUser | undefined
    need_to_handle_password_recovery: boolean
    users_by_id: SupabaseUsersById | undefined
    // TODO: document if and why user_info.chosen_base_id,
    // routing.storage_location and sync.specialised_objects.loading_base_id are
    // different from each other
    chosen_base_id: number | undefined
    bases_by_id: SupabaseKnowledgeBaseWithAccessById | undefined
}
