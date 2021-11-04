import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"
import type { ListItemCRUDRequiredU } from "../form/editable_list/EditableListEntry"

import type { KnowledgeView } from "../shared/interfaces/knowledge_view"
import { ACTIONS } from "../state/actions"
import { get_current_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { factory_get_kv_details, get_all_parent_knowledge_view_ids } from "./common"



const map_state = (state: RootState) =>
{
    const knowledge_view = get_current_knowledge_view_from_state(state)

    return {
        ready_for_reading: state.sync.ready_for_reading,
        knowledge_view,
        knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
        knowledge_views: state.derived.knowledge_views,
        nested_knowledge_view_ids: state.derived.nested_knowledge_view_ids,
        creation_context: state.creation_context,
        editing: !state.display_options.consumption_formatting,
        current_view: state.routing.args.view,
        current_subview_id: state.routing.args.subview_id,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    }
}


const map_dispatch = {
    upsert_knowledge_view: ACTIONS.specialised_object.upsert_knowledge_view,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _KnowledgeViewForm (props: Props)
{
    const { knowledge_view, upsert_knowledge_view } = props

    if (!props.ready_for_reading) return <div>Loading...</div>
    if (!knowledge_view) return <div>No knowledge view selected</div>

    const possible_parent_knowledge_view_options = props.knowledge_views.map(kv => ({ id: kv.id, title: kv.title }))
    const current_kv_parent_ids = get_all_parent_knowledge_view_ids(props.nested_knowledge_view_ids.map, props.current_subview_id)

    const update_item = (knowledge_view: KnowledgeView) => upsert_knowledge_view({ knowledge_view })
    const crud: ListItemCRUDRequiredU<KnowledgeView> = {
        create_item: () => { throw new Error("Not implemented create knowledge view") },
        update_item,
        delete_item: () => { throw new Error("Not implemented delete knowledge view") },
    }

    return factory_get_kv_details({
        ...props,
        possible_parent_knowledge_view_options,
        current_kv_parent_ids,
    })(knowledge_view, crud)
}


export const KnowledgeViewForm = connector(_KnowledgeViewForm) as FunctionalComponent<{}>
