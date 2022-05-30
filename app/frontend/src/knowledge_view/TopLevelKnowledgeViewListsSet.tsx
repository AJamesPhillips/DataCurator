import { FunctionComponent, h } from "preact"
import { useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { is_defined } from "../shared/utils/is_defined"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { get_all_parent_knowledge_view_ids } from "./common"
import { KnowledgeViewListsSet } from "./KnowledgeViewListsSet"



interface OwnProps {}


const map_state = (state: RootState) => ({
    ready: state.sync.ready_for_reading,
    knowledge_views: state.derived.knowledge_views,
    nested_knowledge_view_ids: state.derived.nested_knowledge_view_ids,
    knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
    wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    creation_context: state.creation_context,
    current_view: state.routing.args.view,
    current_subview_id: state.routing.args.subview_id,
    editing: !state.display_options.consumption_formatting,
    chosen_base_id: state.user_info.chosen_base_id,
    bases_by_id: state.user_info.bases_by_id,
})

const map_dispatch = {
    upsert_knowledge_view: ACTIONS.specialised_object.upsert_knowledge_view,
    update_chosen_base_id: ACTIONS.user_info.update_chosen_base_id,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _TopLevelKnowledgeViewListsSet (props: Props)
{
    if (props.knowledge_views.length === 0)
    {
        return <div style={{ cursor: "progress" }}>
            {props.ready ? "Automatically creating a knowledge view..." : "Loading..." }
        </div>
    }


    const possible_parent_knowledge_view_ids = useMemo(() =>
        props.knowledge_views.filter(kv => kv.base_id === props.chosen_base_id).map(kv => kv.id)
    , [props.knowledge_views])
    const knowledge_views = props.nested_knowledge_view_ids.top_ids.map(id => props.knowledge_views_by_id[id])
        .filter(is_defined)

    const current_kv_parent_ids = get_all_parent_knowledge_view_ids(props.nested_knowledge_view_ids.map, props.current_subview_id)

    return <KnowledgeViewListsSet
        {...props}
        parent_knowledge_view_id={undefined}
        knowledge_views={knowledge_views}
        possible_parent_knowledge_view_ids={possible_parent_knowledge_view_ids}
        upsert_knowledge_view={props.upsert_knowledge_view}
        current_kv_parent_ids={current_kv_parent_ids}
        chosen_base_id={props.chosen_base_id}
        bases_by_id={props.bases_by_id}
        update_chosen_base_id={props.update_chosen_base_id}
    />
}

export const TopLevelKnowledgeViewListsSet = connector(_TopLevelKnowledgeViewListsSet) as FunctionComponent<OwnProps>
