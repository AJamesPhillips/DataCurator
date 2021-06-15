import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { KnowledgeViewList } from "./KnowledgeViewList"
import { ACTIONS } from "../state/actions"
import type { ViewType } from "../state/routing/interfaces"
import type { RootState } from "../state/State"
import { LinkButton } from "../utils/Link"
import { get_current_UI_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import { alert_wcomponent_is_prioritisation } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_created_at_ms } from "../shared/wcomponent/utils_datetime"



interface OwnProps {}


const map_state = (state: RootState) =>
{
    const base_kv = state.derived.base_knowledge_view
    const base_knowledge_view_id = base_kv && base_kv.id


    const kv = get_current_UI_knowledge_view_from_state(state)

    let prioritisation_id: string | undefined = undefined
    if (kv)
    {
        let latest_created_at_ms = Number.NEGATIVE_INFINITY

        kv.wc_ids_by_type.prioritisation.forEach(id =>
        {
            const p = state.specialised_objects.wcomponents_by_id[id]
            if (!alert_wcomponent_is_prioritisation(p, id)) return

            const p_latest_created_at_ms = get_created_at_ms(p)
            if (p_latest_created_at_ms > latest_created_at_ms)
            {
                latest_created_at_ms = p_latest_created_at_ms
                prioritisation_id = id
            }
        })
    }


    return {
        base_knowledge_view_id,
        prioritisation_id,
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
        <ViewLinkButton view="priorities_list" name="List" subview_id={props.prioritisation_id} />
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
