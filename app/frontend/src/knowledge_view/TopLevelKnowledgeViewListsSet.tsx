import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { is_defined } from "../shared/utils/is_defined"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { get_all_parent_knowledge_view_ids } from "./common"
import { KnowledgeViewListsSet } from "./KnowledgeViewListsSet"



interface OwnProps {}


const map_state = (state: RootState) => ({
    ready: state.sync.ready,
    base_knowledge_view: state.derived.base_knowledge_view,
    knowledge_views: state.derived.knowledge_views,
    knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
    nested_knowledge_view_ids: state.derived.nested_knowledge_view_ids,
    creation_context: state.creation_context,
    current_view: state.routing.args.view,
    current_subview_id: state.routing.args.subview_id,
    editing: !state.display_options.consumption_formatting,
})

const map_dispatch = {
    upsert_knowledge_view: ACTIONS.specialised_object.upsert_knowledge_view,
}

const connector = connect(map_state, map_dispatch)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _TopLevelKnowledgeViewListsSet (props: Props)
{
    if (!props.base_knowledge_view)
    {
        return <div style={{ cursor: "progress" }}>
            {props.ready ? "Automatically creating base knowledge view..." : "Loading..." }
        </div>
    }


    const possible_parent_knowledge_view_options = props.knowledge_views.map(kv => ({ id: kv.id, title: kv.title }))
    const knowledge_views = props.nested_knowledge_view_ids.top_ids.map(id => props.knowledge_views_by_id[id])
        .filter(is_defined)

    const current_kv_parent_ids = get_all_parent_knowledge_view_ids(props.nested_knowledge_view_ids.map, props.current_subview_id)

    return <KnowledgeViewListsSet
        {...props}
        parent_knowledge_view_id={undefined}
        knowledge_views={knowledge_views}
        possible_parent_knowledge_view_options={possible_parent_knowledge_view_options}
        upsert_knowledge_view={props.upsert_knowledge_view}
        current_kv_parent_ids={current_kv_parent_ids}
    />
}

export const TopLevelKnowledgeViewListsSet = connector(_TopLevelKnowledgeViewListsSet) as FunctionComponent<OwnProps>
