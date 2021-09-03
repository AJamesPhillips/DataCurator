import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { EditableNumber } from "../form/EditableNumber"
import { WComponentCanvasNode } from "../knowledge/canvas_node/WComponentCanvasNode"
import type { WComponentNodeGoal } from "../shared/wcomponent/interfaces/goal"
import type { PrioritisedGoalAttributes, WComponentPrioritisation } from "../shared/wcomponent/interfaces/priorities"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"



interface OwnProps
{
    goal: WComponentNodeGoal
    selected_prioritisation: WComponentPrioritisation | undefined
}



const map_state = (state: RootState) => ({
    editing: !state.display_options.consumption_formatting,
})


const map_dispatch = {
    upsert_wcomponent: ACTIONS.specialised_object.upsert_wcomponent,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps




function _PrioritisableGoal (props: Props)
{
    const { goal, selected_prioritisation, editing } = props

    const goal_prioritisation_attributes = selected_prioritisation && selected_prioritisation.goals || {}
    const effort = goal_prioritisation_attributes[goal.id]?.effort

    return <div style={{ display: "flex" }}>
        <WComponentCanvasNode id={goal.id} on_graph={false} />

        {selected_prioritisation && (editing || !!effort) && <div>
            <br />
            <EditableNumber
                placeholder="Effort"
                allow_undefined={true}
                value={effort}
                conditional_on_blur={new_effort =>
                {
                    const goals_attributes: PrioritisedGoalAttributes = { ...goal_prioritisation_attributes }
                    if (new_effort === undefined) delete goals_attributes[goal.id]
                    else goals_attributes[goal.id] = { effort: new_effort }

                    const new_selected_prioritisation = { ...selected_prioritisation, goals: goals_attributes }
                    props.upsert_wcomponent({ wcomponent: new_selected_prioritisation })
                }}
            />
        </div>}

    </div>
}

export const PrioritisableGoal = connector(_PrioritisableGoal) as FunctionalComponent<OwnProps>
