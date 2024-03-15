import { FunctionComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { is_defined } from "../shared/utils/is_defined"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { get_title } from "../sharedf/rich_text/get_rich_text"


interface OwnProps
{
    wcomponent_ids?: string[]
}


const map_state = (state: RootState) =>
{
    return {
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
    }
}

const map_dispatch = {
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentsList (props: Props)
{
    const { wcomponent_ids = [], wcomponents_by_id, knowledge_views_by_id } = props

    const wcomponents = wcomponent_ids.map(id => wcomponents_by_id[id]).filter(is_defined)

    const wc_id_to_counterfactuals_map = {}

    // Not using the values from routings.args as this is used for List of Actions in Priorities view
    // If going to change this then review that functionality too
    const created_at_ms = new Date().getTime()
    const sim_ms = created_at_ms

    return <table class="list">
        <tbody>
            {wcomponents.map(wcomponent => <tr
                style={{ cursor: "pointer" }}
                onClick={() => props.change_route({ item_id: wcomponent.id })}
            >
                {get_title({
                    wcomponent,
                    wcomponents_by_id, knowledge_views_by_id, wc_id_to_counterfactuals_map,
                    created_at_ms, sim_ms,
                })}
            </tr>)}
        </tbody>
    </table>
}


export const WComponentsList = connector(_WComponentsList) as FunctionComponent<OwnProps>
