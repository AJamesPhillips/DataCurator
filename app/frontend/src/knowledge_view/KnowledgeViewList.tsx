import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { Link } from "../utils/Link"



interface OwnProps {}


const map_state = (state: RootState) => ({
    ready: state.sync.ready,
    base_knowledge_view: state.derived.base_knowledge_view,
    other_knowledge_views: state.derived.other_knowledge_views,
})

const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _KnowledgeViewList (props: Props)
{
    const { ready, base_knowledge_view, other_knowledge_views } = props

    const base_title = base_knowledge_view && base_knowledge_view.title !== "Base"
        ? `Base (${base_knowledge_view.title})`
        : "Base"

    return <div>
        {!base_knowledge_view && <div style={{ cursor: "progress" }}>
            {ready ? "Automatically creating base knowledge view..." : "Loading..." }
        </div>}

        {base_knowledge_view && <Link
            route={undefined}
            sub_route={undefined}
            item_id={undefined}
            args={{ view: "knowledge", subview_id: base_knowledge_view.id }}
            selected_on={new Set(["route", "args.subview_id"])}
        >
            {base_title}
        </Link>}

        <br />

        {other_knowledge_views.map(({ id, title }) => <Link
            route={undefined}
            sub_route={undefined}
            item_id={undefined}
            args={{ view: "knowledge", subview_id: id }}
            selected_on={new Set(["route", "args.subview_id"])}
        >
            {title}
        </Link>)}
    </div>
}

export const KnowledgeViewList = connector(_KnowledgeViewList) as FunctionComponent<OwnProps>
