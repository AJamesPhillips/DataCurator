import type { Base } from "../../../shared/interfaces/base"



export function clean_base_object_of_sync_meta_fields <U extends Base> (item: U): U
{
    item = { ...item }

    delete item.needs_save
    delete item.saving

    return item
}
