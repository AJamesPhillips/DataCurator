import { is_defined } from "../../shared/utils/is_defined"
import { SortDirection, sort_list } from "../../shared/utils/sort"
import { update_substate } from "../../utils/update_state"
import type { WComponentHasObjectives, WComponentJudgement } from "../../wcomponent/interfaces/judgement"
import { wcomponent_is_goal, wcomponent_is_judgement_or_objective } from "../../wcomponent/interfaces/SpecialisedObjects"
import { default_wcomponent_validity_value, get_wcomponent_validity_value } from "../../wcomponent_derived/get_wcomponent_validity_value"
import { get_wcomponents_from_state } from "../specialised_objects/accessors"
import type { RootState } from "../State"
import { derived_composed_wcomponents_by_id_reducer } from "./derived_composed_wcomponents_by_id_reducer"
import { get_wcomponent_ids_by_type } from "./get_wcomponent_ids_by_type"
import { knowledge_views_derived_reducer } from "./knowledge_views/knowledge_views_derived_reducer"



export function derived_state_reducer (prev_state: RootState, state: RootState)
{

    if (prev_state.specialised_objects.wcomponents_by_id !== state.specialised_objects.wcomponents_by_id)
    {
        const ids = Object.keys(state.specialised_objects.wcomponents_by_id)
        const wcomponent_ids_by_type = get_wcomponent_ids_by_type(state.specialised_objects.wcomponents_by_id, ids)
        state = update_substate(state, "derived", "wcomponent_ids_by_type", wcomponent_ids_by_type)


        const judgement_or_objectives = get_judgement_or_objectives(state, state.derived.wcomponent_ids_by_type.judgement_or_objective)

        const judgement_or_objective_ids_by_target_id = update_judgement_or_objective_ids_by_target_id(judgement_or_objectives)
        state = update_substate(state, "derived", "judgement_or_objective_ids_by_target_id", judgement_or_objective_ids_by_target_id)

        const goals = get_wcomponents_from_state(state, state.derived.wcomponent_ids_by_type.goal)
            .filter(is_defined)
            .filter(wcomponent_is_goal)

        const judgement_or_objective_ids_by_goal_or_action_id = update_judgement_or_objective_ids_by_goal_or_action_id(goals)
        state = update_substate(state, "derived", "judgement_or_objective_ids_by_goal_or_action_id", judgement_or_objective_ids_by_goal_or_action_id)
    }


    state = knowledge_views_derived_reducer(prev_state, state)
    // IMPORTANT: derived_composed_wcomponents_by_id_reducer MUST go after knowledge_views_derived_reducer as it
    // uses the `state.derived.current_composed_knowledge_view.composed_wc_id_map` value
    state = derived_composed_wcomponents_by_id_reducer(prev_state, state)
    state = conditionally_update_active_judgement_or_objective_ids(prev_state, state)


    return state
}



function get_judgement_or_objectives (state: RootState, judgement_or_objective_ids: Set<string>)
{
    const judgement_or_objectives = get_wcomponents_from_state(state, judgement_or_objective_ids)
        .filter(is_defined)
        .filter(wcomponent_is_judgement_or_objective)

    return judgement_or_objectives
}



function update_judgement_or_objective_ids_by_target_id (judgement_or_objectives: WComponentJudgement[])
{
    const judgement_or_objective_ids_by_target_id: { [target_id: string]: string[] } = {}

    judgement_or_objectives
    // .sort () // some kind of sort so that front end display is stable and predictable
    .forEach(judgement =>
    {
        const target_id = judgement.judgement_target_wcomponent_id
        if (!target_id) return

        const judgement_or_objective_ids = judgement_or_objective_ids_by_target_id[target_id] || []
        judgement_or_objective_ids.push(judgement.id)
        judgement_or_objective_ids_by_target_id[target_id] = judgement_or_objective_ids
    })

    return judgement_or_objective_ids_by_target_id
}



function update_judgement_or_objective_ids_by_goal_or_action_id (goals_and_actions: WComponentHasObjectives[])
{
    const judgement_or_objective_ids_by_goal_or_action_id: { [goal_or_action_id: string]: string[] } = {}

    goals_and_actions
    // .sort () // some kind of sort so that front end display is stable and predictable
    .forEach(({ id: goal_or_action_id, objective_ids }) =>
    {
        judgement_or_objective_ids_by_goal_or_action_id[goal_or_action_id] = objective_ids || []
    })

    return judgement_or_objective_ids_by_goal_or_action_id
}



function conditionally_update_active_judgement_or_objective_ids (prev_state: RootState, state: RootState): RootState
{
    let { current_composed_knowledge_view } = state.derived

    const kv_id_changed = prev_state.derived.current_composed_knowledge_view?.id !== current_composed_knowledge_view?.id

    const judgement_or_objective_ids_by_target_id_changed = prev_state.derived.judgement_or_objective_ids_by_target_id !== state.derived.judgement_or_objective_ids_by_target_id

    const { created_at_ms, sim_ms } = state.routing.args
    const created_at_ms_changed = prev_state.routing.args.created_at_ms !== created_at_ms
    const sim_ms_changed = prev_state.routing.args.sim_ms !== sim_ms


    // todo: we should update when the order of elements in current_composed_knowledge_view
    // changes so that ... <todo insert reason.  Perhaps it's so that the list of judgements / objectives
    // are in the correct order when they are rendered on/for their targets and for their goals or actions?>
    if (current_composed_knowledge_view && (kv_id_changed || judgement_or_objective_ids_by_target_id_changed || created_at_ms_changed || sim_ms_changed))
    {
        const active_judgement_or_objective_ids_by_target_id: { [id: string]: string[] } = {}
        const active_judgement_or_objective_ids_by_goal_or_action_id: { [id: string]: string[] } = {}


        const { wc_ids_by_type, composed_visible_wc_id_map } = current_composed_knowledge_view
        const judgement_or_objectives = get_judgement_or_objectives(state, wc_ids_by_type.judgement_or_objective)

        const active_judgement_or_objectives_by_id: { [id: string]: boolean } = {}
        judgement_or_objectives.forEach(judgement =>
        {
            if (!composed_visible_wc_id_map[judgement.id]) return

            const { is_valid } = get_wcomponent_validity_value({ wcomponent: judgement, created_at_ms, sim_ms }) || default_wcomponent_validity_value()
            if (!is_valid) return

            active_judgement_or_objectives_by_id[judgement.id] = true
        })



        // Get sort key for (judgement or objective) ids based on insertion order in
        // composed_visible_wc_id_map
        const wcomponent_ids_sort_key: {[id: string]: number} = {}
        Object.keys(composed_visible_wc_id_map).forEach((id, index) =>
        {
            wcomponent_ids_sort_key[id] = index
        })
        const get_wcomponent_ids_sort_key = (id: string) => wcomponent_ids_sort_key[id] || -1



        function judgement_or_objective_id_is_active (id: string)
        {
            return active_judgement_or_objectives_by_id[id]
        }


        const {
            judgement_or_objective_ids_by_target_id,
            judgement_or_objective_ids_by_goal_or_action_id,
        } = state.derived

        Object.keys(composed_visible_wc_id_map)
        .forEach(id =>
        {
            const target_ids = judgement_or_objective_ids_by_target_id[id]
            const ids_from_goal_or_action = judgement_or_objective_ids_by_goal_or_action_id[id]

            if (target_ids)
            {
                const active_judgement_or_objective_ids = target_ids.filter(judgement_or_objective_id_is_active)
                if (active_judgement_or_objective_ids.length)
                {
                    const sorted = sort_list(active_judgement_or_objective_ids, get_wcomponent_ids_sort_key, SortDirection.descending)

                    active_judgement_or_objective_ids_by_target_id[id] = sorted
                }
            }

            if (ids_from_goal_or_action)
            {
                const active_judgement_or_objective_ids = ids_from_goal_or_action.filter(judgement_or_objective_id_is_active)
                if (active_judgement_or_objective_ids.length)
                {
                    const sorted = sort_list(active_judgement_or_objective_ids, get_wcomponent_ids_sort_key, SortDirection.descending)

                    active_judgement_or_objective_ids_by_goal_or_action_id[id] = sorted
                }
            }
        })


        current_composed_knowledge_view = {
            ...current_composed_knowledge_view,
            active_judgement_or_objective_ids_by_target_id,
            active_judgement_or_objective_ids_by_goal_or_action_id,
        }
        state = update_substate(state, "derived", "current_composed_knowledge_view", current_composed_knowledge_view)
    }


    return state
}
