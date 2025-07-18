import { get_supabase } from "datacurator-core/supabase/get_supabase"

import type {
    JoinedAccessControlsPartial,
    SupabaseKnowledgeBase,
    SupabaseKnowledgeBaseWithAccess
} from "./interfaces"



export async function get_all_bases (user_id?: string)
{
    const supabase = get_supabase()
    const res = await supabase.from("bases")
        .select("*, access_controls(access_level,user_id)")
        .order("inserted_at", { ascending: true })

    const data: SupabaseKnowledgeBaseWithAccess[] | undefined = !res.data ? undefined : res.data.map(r =>
    {
        return base_supabase_to_app(r, r.access_controls, user_id)
    })

    return { error: res.error, data }
}



export async function create_a_base (args: { owner_user_id: string, title?: string })
{
    const { owner_user_id, title = "Primary" } = args

    const supabase = get_supabase()
    const res = await supabase
        .from("bases")
        .insert({ owner_user_id, title })
        .select()

    const base = res.data && res.data[0] || undefined

    return { base, error: res.error }
}



function santise_base (base: SupabaseKnowledgeBase): SupabaseKnowledgeBase
{
    // Will drop other fields like:
    // * `access_control` from `SupabaseKnowledgeBaseWithAccess`
    // * `access_controls` from api call with `select` join
    const santised_base: SupabaseKnowledgeBase = {
        id: base.id,
        inserted_at: base.inserted_at,
        updated_at: base.updated_at,
        owner_user_id: base.owner_user_id,
        public_read: base.public_read,
        title: base.title,
        default_knowledge_view_id: base.default_knowledge_view_id,
    }
    return santised_base
}



function base_supabase_to_app (base: SupabaseKnowledgeBase, access_controls: JoinedAccessControlsPartial[] | undefined, user_id?: string): SupabaseKnowledgeBaseWithAccess
{
    let { inserted_at, updated_at } = base
    const { owner_user_id, public_read } = base
    inserted_at = new Date(inserted_at)
    updated_at = new Date(updated_at)

    const access_control = access_controls?.find(ac => ac.user_id === user_id)
    const access_level = access_control?.access_level || (user_id === owner_user_id ? "owner" : (public_read ? "viewer" : "none"))
    const can_edit = access_level === "owner" || access_level === "editor"

    return { ...santise_base(base), inserted_at, updated_at, access_level, can_edit }
}



export async function modify_base (base: SupabaseKnowledgeBase)
{
    const santised_base = santise_base(base)

    const supabase = get_supabase()
    const res = await supabase
        .from("bases")
        .update(santised_base)
        .eq("id", santised_base.id)

    return res
}
