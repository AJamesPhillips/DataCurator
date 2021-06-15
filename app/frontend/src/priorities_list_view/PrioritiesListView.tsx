import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./PrioritiesListView.css"
import { WComponentCanvasNode } from "../knowledge/canvas_node/WComponentCanvasNode"
import { MainArea } from "../layout/MainArea"
import type { WComponentNodeGoal } from "../shared/wcomponent/interfaces/goal"
import {
    alert_wcomponent_is_goal,
} from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_current_UI_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { EditableNumber } from "../form/EditableNumber"
import type { PrioritisedGoalAttributes, WComponentPrioritisation } from "../shared/wcomponent/interfaces/priorities"
import { ListHeaderAddButton } from "../form/editable_list/ListHeaderAddButton"
import { create_wcomponent } from "../knowledge/create_wcomponent_type"
import { Prioritisation } from "./Prioritisation"
import { ACTIONS } from "../state/actions"



export function PrioritiesListView (props: {})
{
    return <MainArea
        main_content={<PrioritiesListViewContent />}
    />
}



const map_state = (state: RootState) =>
{
    const wcomponents_by_id = state.specialised_objects.wcomponents_by_id

    const knowledge_view = get_current_UI_knowledge_view_from_state(state)
    const goals: WComponentNodeGoal[] = []
    let prioritisations: WComponentPrioritisation[] = []

    if (knowledge_view)
    {
        knowledge_view.wc_ids_by_type.goal.forEach(id =>
        {
            const goal = wcomponents_by_id[id]

            if (!alert_wcomponent_is_goal(goal, id)) return

            goals.push(goal)
        })

        prioritisations = knowledge_view.prioritisations
    }


    const { item_id } = state.routing
    const selected_prioritisation = prioritisations.find(({ id }) => id === item_id)

    return {
        knowledge_view_id: knowledge_view && knowledge_view.id,
        goals,
        prioritisations,
        editing: !state.display_options.consumption_formatting,
        creation_context: state.creation_context,
        selected_prioritisation,
    }
}


const map_dispatch = {
    upsert_wcomponent: ACTIONS.specialised_object.upsert_wcomponent,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _PrioritiesListViewContent (props: Props)
{
    const { goals, prioritisations, editing, knowledge_view_id, selected_prioritisation } = props

    const goal_prioritisation_attributes = selected_prioritisation && selected_prioritisation.goals || {}

    return <div className="priorities_list_view_content">
        <div className="goals">
            <h1>Potential</h1>

            {goals.map(goal => <div style={{ display: "flex" }}>
                <WComponentCanvasNode id={goal.id} on_graph={false} />

                {selected_prioritisation && editing && <div>
                    <br />
                    <span class="description_label">Effort</span> &nbsp;
                    <EditableNumber
                        placeholder="..."
                        allow_undefined={true}
                        value={goal_prioritisation_attributes[goal.id]?.effort}
                        on_change={new_effort =>
                        {

                            const goals_attributes: PrioritisedGoalAttributes = { ...goal_prioritisation_attributes }
                            if (new_effort === undefined) delete goals_attributes[goal.id]
                            else goals_attributes[goal.id] = { effort: new_effort }

                            const new_selected_prioritisation = { ...selected_prioritisation, goals: goals_attributes }
                            props.upsert_wcomponent({ wcomponent: new_selected_prioritisation })
                        }}
                    />
                </div>}

            </div>)}

            <h1>Prioritised</h1>
            <h1>Deprioritised</h1>
        </div>



        <div className="prioritisations">
            <div className="prioritisations_header">
                <h1>Prioritisations</h1>

                {editing && knowledge_view_id && <ListHeaderAddButton
                    new_item_descriptor="Prioritisation"
                    on_pointer_down_new_list_entry={() =>
                    {
                        create_wcomponent({
                            wcomponent: { type: "prioritisation" },
                            creation_context: props.creation_context,
                            add_to_knowledge_view: {
                                id: knowledge_view_id,
                                position: { left: 0, top: 0 },
                            }
                        })
                    }}
                />}
            </div>


            {prioritisations.map(p => <Prioritisation prioritisation={p}/>)}
        </div>
    </div>
}

const PrioritiesListViewContent = connector(_PrioritiesListViewContent) as FunctionalComponent<{}>
