import { get_supabase } from "./get_supabase"
import type {
    SupabaseKnowledgeBase,
    JoinedAccessControlsPartial,
    SupabaseKnowledgeBaseWithAccess,
    DBSupabaseKnowledgeBaseWithAccess
} from "./interfaces"



export async function get_all_bases ()
{
    const supabase = get_supabase()
    const res = await supabase.from<DBSupabaseKnowledgeBaseWithAccess>("bases")
        .select("*, access_controls(access_level)")
        .order("inserted_at", { ascending: true })


    const data: SupabaseKnowledgeBaseWithAccess[] | undefined = !res.data ? undefined : res.data.map(r =>
    {
        return base_supabase_to_app(r, r.access_controls)
    })

    return { error: res.error, data }
}



export function santise_base (base: SupabaseKnowledgeBase): SupabaseKnowledgeBase
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
    }
    return santised_base
}



function base_supabase_to_app (base: SupabaseKnowledgeBase, access_controls?: JoinedAccessControlsPartial[]): SupabaseKnowledgeBaseWithAccess
{
    let { inserted_at, updated_at } = base
    inserted_at = new Date(inserted_at)
    updated_at = new Date(updated_at)

    const access_control = access_controls && access_controls[0]
    const access_level = access_control && access_control.access_level

    return { ...santise_base(base), inserted_at, updated_at, access_level }
}
