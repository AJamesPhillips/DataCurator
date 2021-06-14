import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { KnowledgeViewList } from "./KnowledgeViewList"
import { ACTIONS } from "../state/actions"
import type { ViewType } from "../state/routing/interfaces"
import type { RootState } from "../state/State"
import { LinkButton } from "../utils/Link"



interface OwnProps {}


const map_state = (state: RootState) =>
{
    const base_kv = state.derived.base_knowledge_view
    const base_knowledge_view_id = base_kv && base_kv.id

    return {
        base_knowledge_view_id,
    }
}


const map_dispatch = {
    upsert_knowledge_view: ACTIONS.specialised_object.upsert_knowledge_view,
}

const connector = connect(map_state, map_dispatch)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _ViewsSidePanel (props: Props)
{
    return <div className="views_side_panel">
        <h3>Views</h3>

        <ViewLinkButton view="priorities" />
        <ViewLinkButton view="priorities_list" name="List" />
        <br />
        <ViewLinkButton view="knowledge" subview_id={props.base_knowledge_view_id} />
        <br />

        <hr />

        <KnowledgeViewList />

    </div>
}


export const ViewsSidePanel = connector(_ViewsSidePanel) as FunctionComponent<OwnProps>



interface ViewLinkButtonProps
{
    view: ViewType
    name?: string
    subview_id?: string
}
function ViewLinkButton (props: ViewLinkButtonProps)
{
    const name = props.name || (props.view[0]!.toUpperCase() + props.view.slice(1))

    return <LinkButton
        name={name}
        route={undefined}
        sub_route={undefined}
        item_id={undefined}
        args={{ view: props.view, subview_id: props.subview_id }}
        selected_on={new Set(["args.view"])}
    />
}
