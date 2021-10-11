import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./PrioritiesListView.css"
import { MainArea } from "../layout/MainArea"
import type { WComponentNodeGoal } from "../wcomponent/interfaces/goal"
import { wcomponent_is_goal } from "../wcomponent/interfaces/SpecialisedObjects"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import type { PrioritisedGoalAttributes, WComponentPrioritisation } from "../wcomponent/interfaces/priorities"
import { ListHeaderAddButton } from "../form/editable_list/ListHeaderAddButton"
import { create_wcomponent } from "../state/specialised_objects/wcomponents/create_wcomponent_type"
import { Prioritisation } from "./Prioritisation"
import { ACTIONS } from "../state/actions"
import { PrioritisableGoal } from "./PrioritisableGoal"
import { sort_list } from "../shared/utils/sort"
import { get_created_at_ms } from "../shared/utils_datetime/utils_datetime"
import { selector_chosen_base_id } from "../state/user_info/selector"



export function PrioritiesListView (props: {})
{
    return <MainArea
        main_content={<PrioritiesListViewContent />}
    />
}



const map_state = (state: RootState) =>
{
    const wcomponents_by_id = state.specialised_objects.wcomponents_by_id

    const knowledge_view = get_current_composed_knowledge_view_from_state(state)
    const goals: WComponentNodeGoal[] = []
    let prioritisations: WComponentPrioritisation[] = []
    let selected_prioritisation: WComponentPrioritisation | undefined = undefined

    if (knowledge_view)
    {
        prioritisations = knowledge_view.prioritisations

        const { item_id } = state.routing
        selected_prioritisation = prioritisations.find(({ id }) => id === item_id)

        knowledge_view.wc_ids_by_type.goal.forEach(id =>
        {
            const goal = wcomponents_by_id[id]

            if (!wcomponent_is_goal(goal, id)) return

            goals.push(goal)
        })


        if (selected_prioritisation)
        {
            Object.keys(selected_prioritisation.goals).forEach(id =>
            {
                if (knowledge_view.wc_ids_by_type.goal.has(id)) return

                const goal = wcomponents_by_id[id]

                if (!wcomponent_is_goal(goal, id)) return

                goals.push(goal)
            })
        }
    }


    return {
        knowledge_view_id: knowledge_view && knowledge_view.id,
        goals,
        prioritisations,
        editing: !state.display_options.consumption_formatting,
        creation_context: state.creation_context,
        selected_prioritisation,
        base_id: selector_chosen_base_id(state),
    }
}


const map_dispatch = {
    upsert_wcomponent: ACTIONS.specialised_object.upsert_wcomponent,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _PrioritiesListViewContent (props: Props)
{
    const { goals, prioritisations, editing, knowledge_view_id, selected_prioritisation, base_id } = props


    const goal_prioritisation_attributes = selected_prioritisation && selected_prioritisation.goals
    const { potential_goals, prioritised_goals, deprioritised_goals } = partition_and_sort_goals(goals, goal_prioritisation_attributes)

    if (base_id === undefined) return <div>No base id chosen</div> // type guard


    return <div className="priorities_list_view_content">
        <div className="goals">
            <h1>Potential</h1>

            {potential_goals.map(goal => <PrioritisableGoal goal={goal} selected_prioritisation={selected_prioritisation} />)}

            <h1>Prioritised</h1>

            {prioritised_goals.map(goal => <PrioritisableGoal goal={goal} selected_prioritisation={selected_prioritisation} />)}

            <h1>Deprioritised</h1>

            {deprioritised_goals.map(goal => <PrioritisableGoal goal={goal} selected_prioritisation={selected_prioritisation} />)}
        </div>



        <div className="prioritisations">
            <div className="prioritisations_header">
                <h1>Prioritisations</h1>

                {editing && knowledge_view_id && <ListHeaderAddButton
                    new_item_descriptor="Prioritisation"
                    on_pointer_down_new_list_entry={() =>
                    {
                        create_wcomponent({
                            wcomponent: { base_id, type: "prioritisation", goals: goal_prioritisation_attributes || {} },
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



interface PartitionAndSortGoalsReturn
{
    potential_goals: WComponentNodeGoal[]
    prioritised_goals: WComponentNodeGoal[]
    deprioritised_goals: WComponentNodeGoal[]
}
function partition_and_sort_goals (goals: WComponentNodeGoal[], goal_prioritisation_attributes: PrioritisedGoalAttributes | undefined): PartitionAndSortGoalsReturn
{
    let potential_goals: WComponentNodeGoal[] = []
    let prioritised_goals: WComponentNodeGoal[] = []
    let deprioritised_goals: WComponentNodeGoal[] = []


    if (!goal_prioritisation_attributes)
    {
        potential_goals = goals
    }
    else
    {
        goals.forEach(goal =>
        {
            const goal_prioritisation_attribute = goal_prioritisation_attributes[goal.id]

            if (!goal_prioritisation_attribute) potential_goals.push(goal)
            else if (goal_prioritisation_attribute.effort > 0) prioritised_goals.push(goal)
            else deprioritised_goals.push(goal)
        })
    }


    potential_goals = sort_list(potential_goals, get_created_at_ms, "descending")
    prioritised_goals = sort_list(prioritised_goals, factory_get_effort(goal_prioritisation_attributes), "descending")
    deprioritised_goals = sort_list(deprioritised_goals, get_created_at_ms, "descending")


    return { potential_goals, prioritised_goals, deprioritised_goals }
}



function factory_get_effort (goal_prioritisation_attributes: PrioritisedGoalAttributes | undefined)
{
    return (goal: WComponentNodeGoal) => ((goal_prioritisation_attributes || {})[goal.id]?.effort) || 0
}
