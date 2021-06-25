import {
    WComponent,
    wcomponent_can_render_connection,
    wcomponent_is_counterfactual, wcomponent_is_prioritisation,
} from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { WcIdCounterfactualsMap } from "../../../shared/uncertainty/uncertainty"
import { sort_list } from "../../../shared/utils/sort"
import { update_substate } from "../../../utils/update_state"
import type { GraphUIKnowledgeView } from "../../derived/State"
import type { RootState } from "../../State"
import {
    get_base_knowledge_view,
    get_nested_knowledge_view_ids_map,
    get_wcomponents_from_state,
    get_wcomponent_from_state,
} from "../accessors"
import type {
    KnowledgeView,
    KnowledgeViewWComponentIdEntryMap,
} from "../../../shared/wcomponent/interfaces/knowledge_view"
import { get_wcomponent_ids_by_type } from "../../derived/get_wcomponent_ids_by_type"
import { is_knowledge_view_id } from "../../../shared/utils/ids"
import type { WComponentPrioritisation } from "../../../shared/wcomponent/interfaces/priorities"
import { get_sim_datetime_ms } from "../../../shared/wcomponent/utils_datetime"
import { is_defined } from "../../../shared/utils/is_defined"
import type { WComponentType } from "../../../shared/wcomponent/interfaces/wcomponent_base"



export const knowledge_views_derived_reducer = (initial_state: RootState, state: RootState): RootState =>
{

    const one_or_more_knowledge_views_changed = initial_state.specialised_objects.knowledge_views_by_id !== state.specialised_objects.knowledge_views_by_id
    if (one_or_more_knowledge_views_changed)
    {
        state = update_derived_knowledge_view_state(state)
    }



    let initial_kv_id = initial_state.routing.args.subview_id
    initial_kv_id = is_knowledge_view_id(initial_kv_id) ? initial_kv_id : ""
    let current_kv_id = state.routing.args.subview_id
    current_kv_id = is_knowledge_view_id(current_kv_id) ? current_kv_id : ""
    const kv_object_id_changed = initial_kv_id !== current_kv_id
    if (kv_object_id_changed)
    {
        state = update_substate(state, "derived", "current_UI_knowledge_view", undefined)
    }


    const initial_kv = get_knowledge_view(initial_state, initial_kv_id)
    const current_kv = get_knowledge_view(state, current_kv_id)
    const kv_object_changed = initial_kv !== current_kv

    const one_or_more_wcomponents_changed = initial_state.specialised_objects.wcomponents_by_id !== state.specialised_objects.wcomponents_by_id

    const UI_kv_needs_update = kv_object_changed || one_or_more_wcomponents_changed
    const filters_changed = initial_state.filter_context !== state.filter_context


    if (current_kv)
    {
        if (UI_kv_needs_update)
        {
            const current_UI_knowledge_view = update_UI_current_knowledge_view_state(initial_state, state, current_kv)
            const current_UI_knowledge_view_updated_filters = update_filters(state, current_UI_knowledge_view)

            state = update_substate(state, "derived", "current_UI_knowledge_view", current_UI_knowledge_view_updated_filters)
        }
        else if (filters_changed)
        {
            const current_UI_knowledge_view = update_filters(state, state.derived.current_UI_knowledge_view)
            state = update_substate(state, "derived", "current_UI_knowledge_view", current_UI_knowledge_view)
        }
    }


    return state
}



function update_derived_knowledge_view_state (state: RootState): RootState
{
    const { knowledge_views_by_id } = state.specialised_objects
    const knowledge_views = sort_list( Object.values(knowledge_views_by_id), ({ title }) => title, "ascending")
    const priority_knowledge_views = knowledge_views.filter(({ sort_type }) => sort_type !== "hidden" && sort_type !== "archived")
    const base_knowledge_view = get_base_knowledge_view(knowledge_views)
    const nested_knowledge_view_ids_map = get_nested_knowledge_view_ids_map(knowledge_views)
    const priority_nested_knowledge_view_ids_map = get_nested_knowledge_view_ids_map(priority_knowledge_views, true)

    state = {
        ...state,
        derived: {
            ...state.derived,
            knowledge_views,
            base_knowledge_view,
            nested_knowledge_view_ids_map,
            priority_nested_knowledge_view_ids_map,
        },
    }

    return state
}



function get_knowledge_view (state: RootState, id: string)
{
    return state.specialised_objects.knowledge_views_by_id[id]
}



function update_UI_current_knowledge_view_state (intial_state: RootState, state: RootState, current_kv: KnowledgeView)
{
    const derived_wc_id_map = get_derived_wc_id_map(current_kv, intial_state, state)
    const ids = Object.keys(derived_wc_id_map)
    const wcomponents = get_wcomponents_from_state(state, ids).filter(is_defined)
    const wcomponent_nodes = wcomponents.filter(is_wcomponent_node)
    const wcomponent_connections = wcomponents.filter(wcomponent_can_render_connection)
    const wc_id_counterfactuals_map = get_wc_id_counterfactuals_map(state, current_kv)
    const wc_ids_by_type = get_wcomponent_ids_by_type(state, ids)
    const prioritisations = get_prioritisations(state, wc_ids_by_type.prioritisation)

    const current_UI_knowledge_view: GraphUIKnowledgeView = {
        ...current_kv,
        derived_wc_id_map,
        wcomponent_nodes,
        wcomponent_connections,
        wc_id_counterfactuals_map,
        wc_ids_by_type,
        prioritisations,
        filters: { wc_ids_excluded_by_filters: new Set() }
    }
    // do not need to do this but helps reduce confusion when debugging
    delete (current_UI_knowledge_view as any).wc_id_map

    return current_UI_knowledge_view
}



function get_derived_wc_id_map (current_kv: KnowledgeView, intial_state: RootState, state: RootState)
{
    const to_compose: KnowledgeViewWComponentIdEntryMap[] = []

    const foundation_knowledge_view_ids = current_kv.foundation_knowledge_view_ids || []

    foundation_knowledge_view_ids.forEach(id =>
    {
        const new_kv = get_knowledge_view(state, id)

        if (new_kv) to_compose.push(new_kv.wc_id_map)
    })


    to_compose.push(current_kv.wc_id_map)
    const derived_wc_id_map = Object.assign({}, ...to_compose) as KnowledgeViewWComponentIdEntryMap

    return derived_wc_id_map
}



const invalid_node_types = new Set<WComponentType>([
    "causal_link",
    "relation_link",
    "counterfactual",
    "prioritisation",
    // "judgement",
    // "objective",
])
const is_wcomponent_node = (wcomponent: WComponent) => !invalid_node_types.has(wcomponent.type)



function get_wc_id_counterfactuals_map (state: RootState, knowledge_view: KnowledgeView): WcIdCounterfactualsMap
{
    const map: WcIdCounterfactualsMap = {}

    Object.keys(knowledge_view.wc_id_map).forEach(wcomponent_id =>
    {
        const counterfactual = get_wcomponent_from_state(state, wcomponent_id)
        if (!wcomponent_is_counterfactual(counterfactual)) return

        const { target_wcomponent_id, target_VAP_set_id, target_VAP_id } = counterfactual

        const level_VAP_set_ids = map[target_wcomponent_id] || { VAP_set: {} }
        map[target_wcomponent_id] = level_VAP_set_ids

        const level_VAP_ids = level_VAP_set_ids.VAP_set[target_VAP_set_id] || {}
        level_VAP_set_ids.VAP_set[target_VAP_set_id] = level_VAP_ids

        if (level_VAP_ids[target_VAP_id])
        {
            console.error(`Multiple counterfactuals for wcomponent: "${target_wcomponent_id}" VAP_set_id: "${target_VAP_set_id}" VAP_id: "${target_VAP_id}".  Already have counterfactual wcomponent by id: "${level_VAP_ids[target_VAP_id]!.id}", will not overwrite with: "${counterfactual.id}"`)
            return
        }
        level_VAP_ids[target_VAP_id] = counterfactual
    })

    return map
}



function get_prioritisations (state: RootState, prioritisation_ids: Set<string>): WComponentPrioritisation[]
{
    const prioritisations = get_wcomponents_from_state(state, prioritisation_ids)
        .filter(wcomponent_is_prioritisation)

    return sort_list(prioritisations, p => (get_sim_datetime_ms(p) || Number.POSITIVE_INFINITY), "descending")
}



function update_filters (state: RootState, current_UI_knowledge_view?: GraphUIKnowledgeView)
{
    if (!current_UI_knowledge_view) return undefined


    let wc_ids_excluded_by_filters: Set<string> = new Set()


    if (state.filter_context.apply_filter)
    {
        const {
            exclude_by_label_ids: exclude_by_label_ids_list,
            include_by_label_ids: include_by_label_ids_list,
            exclude_by_component_types: exclude_by_component_types_list,
            include_by_component_types: include_by_component_types_list,
        } = state.filter_context.filters

        const exclude_by_label_ids = new Set(exclude_by_label_ids_list)
        const exclude_by_component_types = new Set(exclude_by_component_types_list)
        const include_by_component_types = new Set(include_by_component_types_list)

        const current_wc_ids = Object.keys(current_UI_knowledge_view.derived_wc_id_map)
        const wc_ids_to_exclude = get_wcomponents_from_state(state, current_wc_ids)
        .filter(is_defined)
        .filter(wcomponent =>
        {
            const { label_ids = [], type } = wcomponent
            const applied_ids = new Set(label_ids)

            const labels__should_exclude = !!(label_ids.find(label_id => exclude_by_label_ids.has(label_id)))
            const labels__lacks_include = !!(include_by_label_ids_list.find(label_id => !applied_ids.has(label_id)))

            const types__should_exclude = exclude_by_component_types.has(type)
            const types__lacks_include = include_by_component_types.size > 0 && !include_by_component_types.has(type)

            const should_exclude = labels__should_exclude || labels__lacks_include || types__should_exclude || types__lacks_include

            return should_exclude
        })
        .map(({ id }) => id)


        wc_ids_excluded_by_filters = new Set(wc_ids_to_exclude)
    }


    return {
        ...current_UI_knowledge_view,
        filters: { wc_ids_excluded_by_filters }
    }
}
