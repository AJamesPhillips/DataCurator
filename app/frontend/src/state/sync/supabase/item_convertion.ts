import type { Base } from "../../../shared/interfaces/base"
import type { SupabaseReadItem, SupabaseWriteItem } from "../../../supabase/interfaces"
import { clean_base_object_of_sync_meta_fields } from "./clean_base_object_for_supabase"



interface CommonFields
{
    title: string
}

export function app_item_to_supabase <U extends Base & CommonFields> (item: U, base_id?: number): SupabaseWriteItem<U>
{
    // TODO document why item.base_id might be undefined and or updte types / date in database
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    base_id = item.base_id ?? base_id

    // Document if this is a typeguard / sanity check or if this is actually doing something important?
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (base_id === undefined) throw new Error("Must provide base_id for app_item_to_supabase")

    const json = clean_base_object_of_sync_meta_fields(item)
    // Because base_id is stored a DB field we delete it from the json to stop
    // the data being duplicated or causing confusion.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete (json as any).base_id

    const supabase_item: SupabaseWriteItem<U> = {
        id: item.id,
        modified_at: (item.modified_at ? item.modified_at.toISOString() : undefined),
        // Only used for creating the component, ignored for update due to custom function that
        // has to check modified_at datetime and also base_id of actual item in DB rather than what
        // is claimed here.
        base_id,
        json,
        // Not needed for update, only needed for create
        title: item.title,
    }

    return supabase_item
}



export function supabase_item_to_app <U> (item: SupabaseReadItem<U>): U
{
    let { json } = item
    const { id, base_id, modified_at } = item
    // Append `Z` for datetime value from server as it does not get stored with timezone and javascript's local
    // Date will parse it incorrectly.
    const modified_at_date = modified_at ? new Date(modified_at + "Z") : undefined

    // base_id was previously being duplicated in the json field.  Delete it here as well before using
    // the actual base_id value from the database field.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete (json as any).base_id

    // Ensure all the fields that are edited in the db are set correctly in the json data.
    // Do not update title.  This should only be edited by the client app.  The canonical
    // value is in the DB's json field not the title field.
    json = { ...json, id, base_id, modified_at: modified_at_date }

    return json
}
