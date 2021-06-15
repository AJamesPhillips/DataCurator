import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { MainArea } from "../layout/MainArea"
import type { WComponentNodeGoal } from "../shared/wcomponent/interfaces/goal"
import { wcomponent_is_goal } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_current_UI_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"



export function PrioritiesListView (props: {})
{
    return <MainArea
        main_content={<PrioritiesListViewContent />}
    />
}



const map_state = (state: RootState) => {

    const kv = get_current_UI_knowledge_view_from_state(state)
    const goals: WComponentNodeGoal[] = []

    if (kv)
    {
        kv.wc_ids_by_type.goal.forEach(id =>
        {
            const goal = state.specialised_objects.wcomponents_by_id[id]

            if (!wcomponent_is_goal(goal, id)) return

            goals.push(goal)
        })
    }

    return {
        goals
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



function _PrioritiesListViewContent (props: Props)
{
    return <div>
        <h1>Potential</h1>
        {props.goals.map(goal => <div>{goal.title}</div>)}

        <h1>Prioritised</h1>
        <h1>Deprioritised</h1>
    </div>
}

const PrioritiesListViewContent = connector(_PrioritiesListViewContent) as FunctionalComponent<{}>
