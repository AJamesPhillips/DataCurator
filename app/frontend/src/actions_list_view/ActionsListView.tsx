import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./ActionsListView.scss"
import { MainArea } from "../layout/MainArea"
import { wcomponent_is_action } from "../wcomponent/interfaces/SpecialisedObjects"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import type {
    PrioritisedGoalAttributes,
} from "../wcomponent/interfaces/priorities"
import { ACTIONS } from "../state/actions"
import { PrioritisableAction } from "./PrioritisableAction"
import { sort_list } from "../shared/utils/sort"
import { get_created_at_ms } from "../shared/utils_datetime/utils_datetime"
import { selector_chosen_base_id } from "../state/user_info/selector"
import type { WComponentHasObjectives } from "../wcomponent/interfaces/judgement"
import type { WComponentNodeAction } from "../wcomponent/interfaces/action"
import { get_wcomponent_state_value_and_probabilities } from "../wcomponent_derived/get_wcomponent_state_value"
import { VALUE_POSSIBILITY_IDS } from "../wcomponent/value/parse_value"
import type { Base } from "../shared/interfaces/base"



export function ActionsListView (props: {})
{
    return <MainArea
        main_content={<ActionsListViewContent />}
    />
}



const map_state = (state: RootState) =>
{
    const wcomponents_by_id = state.specialised_objects.wcomponents_by_id

    let filtered_by_knowledge_view_id = ""
    const filter_by_knowledge_view = false
    let action_ids: Set<string> | undefined = undefined

    if (filter_by_knowledge_view)
    {
        const knowledge_view = get_current_composed_knowledge_view_from_state(state)
        if (knowledge_view)
        {
            filtered_by_knowledge_view_id = knowledge_view.id
            action_ids = knowledge_view.wc_ids_by_type.action
        }
    }
    else action_ids = state.derived.wcomponent_ids_by_type.action


    return {
        filtered_by_knowledge_view_id,
        action_ids,
        wcomponents_by_id,
        editing: !state.display_options.consumption_formatting,
        base_id: selector_chosen_base_id(state),
    }
}


const map_dispatch = {
    upsert_wcomponent: ACTIONS.specialised_object.upsert_wcomponent,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _ActionsListViewContent (props: Props)
{
    const { action_ids, wcomponents_by_id, editing, base_id } = props

    if (base_id === undefined) return <div>No base id chosen</div> // type guard
    if (action_ids === undefined) return <div>No actions</div> // type guard


    const now = new Date().getTime()
    let actions = Array.from(action_ids).map(id => wcomponents_by_id[id])
        .filter(wcomponent_is_action)
    actions = sort_list(actions, get_modified_or_created_at, "descending")


    const actions_icebox: WComponentNodeAction[] = []
    const actions_todo: WComponentNodeAction[] = []
    const actions_in_progress: WComponentNodeAction[] = []
    const actions_done_or_rejected: WComponentNodeAction[] = []
    let hidden_done = 0

    actions.forEach(action =>
    {
        const attribute_values = get_wcomponent_state_value_and_probabilities({
            wcomponent: action,
            VAP_set_id_to_counterfactual_v2_map: {}, created_at_ms: now, sim_ms: now
        })

        const most_probable = attribute_values.most_probable_VAP_set_values[0]
        if (most_probable?.value_id === VALUE_POSSIBILITY_IDS.action_in_progress) actions_in_progress.push(action)
        else if (most_probable?.value_id === VALUE_POSSIBILITY_IDS.action_completed || most_probable?.value_id === VALUE_POSSIBILITY_IDS.action_rejected || most_probable?.value_id === VALUE_POSSIBILITY_IDS.action_failed)
        {
            if (actions_done_or_rejected.length < 5) actions_done_or_rejected.push(action)
            else hidden_done++
        }
        else if (action.todo_index) actions_todo.push(action)
        else actions_icebox.push(action)
    })


    const sorted_actions_todo = sort_list(actions_todo, a => a.todo_index || 0, "descending")


    return <div className="action_list_view_content">
        <div className="icebox">
            <h1>Icebox</h1>

            {actions_icebox.map(action => <PrioritisableAction
                key={action.id}
                action={action}
                show_icebox_actions={true}
            />)}
        </div>


        <div className="todo">
            <div className="prioritisations_header">
                <h1>Todo</h1>
            </div>

            {sorted_actions_todo.map(action => <PrioritisableAction
                key={action.id}
                action={action}
                show_todo_actions={true}
            />)}
        </div>


        <div className="in_progress">
            <div className="prioritisations_header">
                <h1>In progress</h1>
            </div>

            {actions_in_progress.map(action => <PrioritisableAction
                key={action.id}
                action={action}
            />)}
        </div>


        <div className="done_or_rejected">
            <div className="prioritisations_header">
                <h1>Done</h1>
            </div>

            {actions_done_or_rejected.map(action => <PrioritisableAction
                key={action.id}
                action={action}
            />)}

            {hidden_done > 0 && <div style={{ textAlign: "center", margin: 40 }}>
                ... {hidden_done} hidden ...
            </div>}
        </div>
    </div>
}

const ActionsListViewContent = connector(_ActionsListViewContent) as FunctionalComponent<{}>



function get_modified_or_created_at (a: Base)
{
    if (a.modified_at) return a.modified_at.getTime()

    return get_created_at_ms(a)
}



interface PartitionAndSortGoalsReturn
{
    potential_goals: WComponentHasObjectives[]
    prioritised_goals: WComponentHasObjectives[]
    deprioritised_goals: WComponentHasObjectives[]
}
function partition_and_sort_goals (goals: WComponentHasObjectives[], goal_prioritisation_attributes: PrioritisedGoalAttributes | undefined): PartitionAndSortGoalsReturn
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


    potential_goals = sort_list(potential_goals, get_created_at_ms, "descending")
    prioritised_goals = sort_list(prioritised_goals, factory_get_effort(goal_prioritisation_attributes), "descending")
    deprioritised_goals = sort_list(deprioritised_goals, get_created_at_ms, "descending")


    return { potential_goals, prioritised_goals, deprioritised_goals }
}



function factory_get_effort (goal_prioritisation_attributes: PrioritisedGoalAttributes | undefined)
{
    return (goal: WComponentHasObjectives) => ((goal_prioritisation_attributes || {})[goal.id]?.effort) || 0
}
