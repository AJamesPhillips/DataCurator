import type { Base } from "../../shared/interfaces/base"
import type { RootState } from "../State"
import { selector_user_name } from "../user_info/selector"



export function update_modified_by <I extends Base> (item: I, state: RootState): I
{
    return update_modified_or_deleted_by(item, state, false)
}



export function mark_as_deleted <I extends Base> (item: I, state: RootState): I
{
    return update_modified_or_deleted_by(item, state, true)
}



export function update_modified_or_deleted_by <I extends Base> (item: I, state: RootState, deleting: boolean): I
{
    item = {
        ...item,
        needs_save: true,

        // Changing this is done by the server.  We have to send the same modified_at that
        // we got from the server
        // modified_at: new Date(),

        // For the server to accept an `UPDATE` command.
        modified_by_username: selector_user_name(state),
    }

    if (deleting) item.deleted_at = new Date()

    return item
}
