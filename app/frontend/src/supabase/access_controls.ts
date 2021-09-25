import { get_supabase } from "./get_supabase"
import type { ACCESS_CONTROL_LEVEL, DBSupabaseAccessControl, SupabaseAccessControl } from "./interfaces"



export async function get_access_controls_for_base (base_id: number)
{
    const supabase = get_supabase()
    const { data, error } = await supabase
        .from<SupabaseAccessControl>("access_controls")
        .select("*")
        .eq("base_id", base_id)

    const access_controls = data && data.map(ac => ({
        ...ac,
        inserted_at: new Date(ac.inserted_at),
        updated_at: new Date(ac.updated_at),
    })) || undefined

    return { access_controls, error }
}



interface UpdateAcessControlArgs
{
    base_id: number
    other_user_id: string
    grant: ACCESS_CONTROL_LEVEL
}
export async function update_access_control (args: UpdateAcessControlArgs)
{
    const access_control: DBSupabaseAccessControl = {
        base_id: args.base_id,
        user_id: args.other_user_id,
        access_level: args.grant,
    }

    const supabase = get_supabase()
    const res = await supabase
        .from<SupabaseAccessControl>("access_controls")
        .upsert(access_control)

    return res
}
