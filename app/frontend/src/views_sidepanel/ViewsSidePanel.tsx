import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { KnowledgeViewList } from "../knowledge_view/KnowledgeViewList"
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
        view: state.routing.args.view,
        subview_id: state.routing.args.subview_id,
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
    const view_types: ViewType[] = ["priorities", "knowledge", "objectives"]
    const views: { view: ViewType, name: string }[] = view_types.map(view => ({
        view, name: view[0].toUpperCase() + view.slice(1)
    }))

    return <div className="views_side_panel">
        <b>Views</b>

        <br />
        <br />

        {views.map(({ view, name }) => {
            const subview_id = view === "knowledge" ? props.base_knowledge_view_id : undefined

            return [
                <LinkButton
                    name={name}
                    route={undefined}
                    sub_route={undefined}
                    item_id={undefined}
                    args={{ view, subview_id }}
                    selected_on={new Set(["args.view"])}
                />,
                <br/>
            ]
        })}

        <br />
        <hr />

        {props.view === "knowledge" && <div>
            <KnowledgeViewList />
        </div>}

    </div>
}


export const ViewsSidePanel = connector(_ViewsSidePanel) as FunctionComponent<OwnProps>
