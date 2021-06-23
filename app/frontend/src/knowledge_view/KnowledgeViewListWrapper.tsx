import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { KnowledgeViewList } from "./KnowledgeViewList"



interface OwnProps {}


const map_state = (state: RootState) => ({
    ready: state.sync.ready,
    base_knowledge_view: state.derived.base_knowledge_view,
    knowledge_views: state.derived.knowledge_views,
    UI_knowledge_views: state.derived.UI_knowledge_views,
    creation_context: state.creation_context,
    current_view: state.routing.args.view,
    editing: !state.display_options.consumption_formatting,
})

const map_dispatch = {
    upsert_knowledge_view: ACTIONS.specialised_object.upsert_knowledge_view,
}

const connector = connect(map_state, map_dispatch)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _TopLevelKnowledgeViewList (props: Props)
{
    if (!props.base_knowledge_view)
    {
        return <div style={{ cursor: "progress" }}>
            {props.ready ? "Automatically creating base knowledge view..." : "Loading..." }
        </div>
    }


    const parent_knowledge_view_options = props.knowledge_views.map(kv => ({ id: kv.id, title: kv.title }))

    return <KnowledgeViewList
        {...props}
        parent_knowledge_view_options={parent_knowledge_view_options}
        upsert_knowledge_view={knowledge_view => props.upsert_knowledge_view({ knowledge_view })}
    />
}

export const KnowledgeViewListWrapper = connector(_TopLevelKnowledgeViewList) as FunctionComponent<OwnProps>
