


export function get_created_at_ms (obj: { created_at: Date, custom_created_at?: Date }): number
{
    return (obj.custom_created_at || obj.created_at).getTime()
}


// sort_list(wcomponent.validity, get_created_at, "ascending")