import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./PrioritiesListView.scss"
import { MainArea } from "../layout/MainArea"
import { wcomponent_has_objectives } from "../wcomponent/interfaces/SpecialisedObjects"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import type {
    PrioritisedGoalOrActionAttributes,
    WComponentPrioritisation,
} from "../wcomponent/interfaces/priorities"
import { create_wcomponent } from "../state/specialised_objects/wcomponents/create_wcomponent_type"
import { Prioritisation } from "./Prioritisation"
import { ACTIONS } from "../state/actions"
import { PrioritisableGoal } from "./PrioritisableGoal"
import { SortDirection, sort_list } from "../shared/utils/sort"
import { get_created_at_ms } from "../shared/utils_datetime/utils_datetime"
import { selector_chosen_base_id } from "../state/user_info/selector"
import type { WComponentHasObjectives } from "../wcomponent/interfaces/judgement"
import { SIDE_PANEL_WIDTH } from "../side_panel/width"
import { Button } from "../sharedf/Button"
import { get_next_available_wc_map_position } from "../knowledge_view/utils/next_wc_map_position"



export function PrioritiesListView (props: {})
{
    return <MainArea
        main_content={<PrioritiesListViewContent />}
    />
}



const map_state = (state: RootState) =>
{
    const wcomponents_by_id = state.specialised_objects.wcomponents_by_id

    const composed_knowledge_view = get_current_composed_knowledge_view_from_state(state)
    const goals_and_actions: WComponentHasObjectives[] = []
    let prioritisations: WComponentPrioritisation[] | undefined = undefined
    let selected_prioritisation: WComponentPrioritisation | undefined = undefined

    if (composed_knowledge_view)
    {
        composed_knowledge_view.wc_ids_by_type.has_objectives.forEach(id =>
        {
            const goal_or_action = wcomponents_by_id[id]

            if (!wcomponent_has_objectives(goal_or_action, id)) return

            goals_and_actions.push(goal_or_action)
        })


        prioritisations = composed_knowledge_view.prioritisations

        const { item_id } = state.routing
        selected_prioritisation = prioritisations.find(({ id }) => id === item_id)
        Object.keys(selected_prioritisation?.goals || {}).forEach(id =>
        {
            if (composed_knowledge_view.wc_ids_by_type.has_objectives.has(id)) return

            const goal_or_action = wcomponents_by_id[id]

            if (!wcomponent_has_objectives(goal_or_action, id)) return

            goals_and_actions.push(goal_or_action)
        })
    }


    return {
        composed_knowledge_view,
        goals_and_actions,
        prioritisations,
        selected_prioritisation,
        base_id: selector_chosen_base_id(state),
        wcomponents_by_id,
        display_side_panel: state.controls.display_side_panel,
    }
}


const map_dispatch = {
    upsert_wcomponent: ACTIONS.specialised_object.upsert_wcomponent,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _PrioritiesListViewContent (props: Props)
{
    const {
        goals_and_actions, prioritisations,
        composed_knowledge_view, selected_prioritisation, base_id, wcomponents_by_id,
    } = props
    const knowledge_view_id = composed_knowledge_view?.id
    const composed_wc_id_map = composed_knowledge_view?.composed_wc_id_map || {}


    const selected_prioritisation_goals = selected_prioritisation?.goals
    const { potential_goals, prioritised_goals, deprioritised_goals } = partition_and_sort_goals(goals_and_actions, selected_prioritisation_goals)


    if (base_id === undefined) return <div>No base id chosen</div> // type guard


    return <div className="priorities_list_view_content">
        <div className="priorities_list goals">
            <h1>Potential</h1>

            {potential_goals.map(goal => <PrioritisableGoal
                key={goal.id}
                goal={goal}
                selected_prioritisation={selected_prioritisation}
            />)}

            <h1>Deprioritised</h1>

            {deprioritised_goals.map(goal => <PrioritisableGoal
                key={goal.id}
                goal={goal}
                selected_prioritisation={selected_prioritisation}
            />)}
        </div>


        <div className="priorities_list goals">
            <h1>Prioritised</h1>

            {prioritised_goals.map(goal => <PrioritisableGoal
                key={goal.id}
                goal={goal}
                selected_prioritisation={selected_prioritisation}
            />)}
        </div>



        <div className="priorities_list prioritisations">
            <h1>
                Prioritisations

                {knowledge_view_id && <span className="button_add_new">
                    &nbsp;
                    <Button
                        fullWidth={false}
                        onClick={e =>
                        {
                            const most_recent_prioritisation_id = (prioritisations || [])[0]?.id || ""
                            const next_prioritisation_position = get_next_available_wc_map_position(composed_wc_id_map, most_recent_prioritisation_id, wcomponents_by_id) || { left: 0, top: 0 }

                            create_wcomponent({
                                wcomponent: {
                                    base_id,
                                    type: "prioritisation",
                                    goals: selected_prioritisation_goals || {},
                                    description: selected_prioritisation?.description || "",
                                },
                                add_to_knowledge_view: {
                                    id: knowledge_view_id,
                                    position: next_prioritisation_position,
                                }
                            })
                        }}
                    >
                        {selected_prioritisation_goals ? "Copy" : "Add"}
                    </Button>
                </span>}
            </h1>

            <div className="prioritisations_list">
                {(prioritisations || []).map(p => <Prioritisation prioritisation={p}/>)}
            </div>
        </div>



        <div
            className="side_panel_padding"
            style={{ minWidth: props.display_side_panel ? SIDE_PANEL_WIDTH : 0 }}
        />
    </div>
}

const PrioritiesListViewContent = connector(_PrioritiesListViewContent) as FunctionalComponent<{}>



interface PartitionAndSortGoalsReturn
{
    potential_goals: WComponentHasObjectives[]
    prioritised_goals: WComponentHasObjectives[]
    deprioritised_goals: WComponentHasObjectives[]
}
function partition_and_sort_goals (goals: WComponentHasObjectives[], goal_prioritisation_attributes: PrioritisedGoalOrActionAttributes | undefined): PartitionAndSortGoalsReturn
{
    let potential_goals: WComponentHasObjectives[] = []
    let prioritised_goals: WComponentHasObjectives[] = []
    let deprioritised_goals: WComponentHasObjectives[] = []


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


    potential_goals = sort_list(potential_goals, get_created_at_ms, SortDirection.descending)
    prioritised_goals = sort_list(prioritised_goals, factory_get_effort(goal_prioritisation_attributes), SortDirection.descending)
    deprioritised_goals = sort_list(deprioritised_goals, get_created_at_ms, SortDirection.descending)


    return { potential_goals, prioritised_goals, deprioritised_goals }
}



function factory_get_effort (goal_prioritisation_attributes: PrioritisedGoalOrActionAttributes | undefined)
{
    return (goal: WComponentHasObjectives) => ((goal_prioritisation_attributes || {})[goal.id]?.effort) || 0
}
