import type { Base } from "../../shared/wcomponent/interfaces/base"
import type { RootState } from "../State"
import { selector_user_name } from "../user_info/selector"



export function mark_as_modified <I extends Base> (item: I, state: RootState): I
{
    return _mark_as_modified(item, state, false)
}



export function mark_as_deleted <I extends Base> (item: I, state: RootState): I
{
    return _mark_as_modified(item, state, true)
}



function _mark_as_modified <I extends Base> (item: I, state: RootState, deleting: boolean): I
{
    item = {
        ...item,
        modified_at: new Date(),
        modified_by_username: selector_user_name(state),
    }

    if (deleting) item.deleted_at = item.modified_at

    return item
}
