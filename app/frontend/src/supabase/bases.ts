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



async function get_an_owned_base (user_id: string)
{
    const supabase = get_supabase()
    const { data: knowledge_bases, error } = await supabase
        .from<SupabaseKnowledgeBase>("bases")
        .select("*")
        .eq("owner_user_id", user_id)
        .order("inserted_at", { ascending: true })

    const base = knowledge_bases && knowledge_bases[0] || undefined

    return { base, error }
}



export async function create_a_base (args: { owner_user_id: string, title?: string })
{
    const { owner_user_id, title = "Primary" } = args

    const supabase = get_supabase()
    const res = await supabase
        .from<SupabaseKnowledgeBase>("bases")
        .insert({ owner_user_id, title })

    const base = res.data && res.data[0] || undefined

    return { base, error: res.error }
}



export async function get_an_owned_base_optionally_create (user_id: string)
{
    const first_get_result = await get_an_owned_base(user_id)
    if (first_get_result.error) return first_get_result
    if (first_get_result.base) return first_get_result

    const res = await create_a_base({ owner_user_id: user_id })

    if (res.error) return res

    // Do not return upserted entry as (due to an incredibly unlikely race condition) this
    // might not be the earliest one. Instead refetch to get earliest Knowledge base
    return await get_an_owned_base(user_id)
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



export async function modify_base (base: SupabaseKnowledgeBase)
{
    const santised_base = santise_base(base)

    const supabase = get_supabase()
    const res = await supabase
        .from<SupabaseKnowledgeBase>("bases")
        .update(santised_base)
        .eq("id", santised_base.id)

    return res
}
