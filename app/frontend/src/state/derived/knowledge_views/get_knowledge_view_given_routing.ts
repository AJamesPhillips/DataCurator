import { is_uuid_v4 } from "../../../shared/utils/ids"
import { get_knowledge_view_from_state } from "../../specialised_objects/accessors"
import type { RootState } from "../../State"



export function get_knowledge_view_given_routing (state: RootState)
{
    let knowledge_view_id = state.routing.args.subview_id
    knowledge_view_id = is_uuid_v4(knowledge_view_id) ? knowledge_view_id : ""

    const knowledge_view = get_knowledge_view_from_state(state, knowledge_view_id)

    return knowledge_view
}
