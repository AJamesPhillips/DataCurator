import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./PrioritiesListView.css"
import { WComponentCanvasNode } from "../knowledge/canvas_node/WComponentCanvasNode"
import { MainArea } from "../layout/MainArea"
import type { WComponentNodeGoal } from "../shared/wcomponent/interfaces/goal"
import { alert_wcomponent_is_goal } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_current_UI_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { EditableNumber } from "../form/EditableNumber"



export function PrioritiesListView (props: {})
{
    return <MainArea
        main_content={<PrioritiesListViewContent />}
    />
}



const map_state = (state: RootState) =>
{
    const wcomponents_by_id = state.specialised_objects.wcomponents_by_id

    const kv = get_current_UI_knowledge_view_from_state(state)
    const goals: WComponentNodeGoal[] = []

    if (kv)
    {
        kv.wc_ids_by_type.goal.forEach(id =>
        {
            const goal = wcomponents_by_id[id]

            if (!alert_wcomponent_is_goal(goal, id)) return

            goals.push(goal)
        })
    }

    return {
        goals,
        wcomponents_by_id,
        wc_id_counterfactuals_map: kv?.wc_id_counterfactuals_map,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



function _PrioritiesListViewContent (props: Props)
{
    const { wcomponents_by_id, wc_id_counterfactuals_map, created_at_ms, sim_ms } = props

    return <div className="priorities_list_view_content">
        <h1>Potential</h1>

        {props.goals.map(goal => <div style={{ display: "flex" }}>
            <WComponentCanvasNode id={goal.id} on_graph={false} />

            <div>
                <br />
                <span class="description_label">Effort</span> &nbsp;
                <EditableNumber placeholder="..." allow_undefined={false} value={0} on_change={new_effort => {}} />
            </div>

        </div>)}

        <h1>Prioritised</h1>
        <h1>Deprioritised</h1>
    </div>
}

const PrioritiesListViewContent = connector(_PrioritiesListViewContent) as FunctionalComponent<{}>
