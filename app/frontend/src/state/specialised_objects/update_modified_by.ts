import type { Base } from "../../shared/interfaces/base"
import type { RootState } from "../State"
import { selector_user_name } from "../user_info/selector"



export function update_modified_by <I extends Base> (item: I, state: RootState): I
{
    return _update_modified_by(item, state, false)
}



export function mark_as_deleted <I extends Base> (item: I, state: RootState): I
{
    return _update_modified_by(item, state, true)
}



function _update_modified_by <I extends Base> (item: I, state: RootState, deleting: boolean): I
{
    item = {
        ...item,
        needs_save: true,
        // modified_at: new Date(), // this is done by the server.  We have to send the same modified_at
        // for the server to accept an `UPDATE` command.
        modified_by_username: selector_user_name(state),
    }

    if (deleting) item.deleted_at = new Date()

    return item
}
