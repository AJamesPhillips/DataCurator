import {
    wcomponent_is_counterfactual,
} from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { WcIdCounterfactualsMap } from "../../../shared/uncertainty/uncertainty"
import { sort_list } from "../../../shared/utils/sort"
import { update_substate } from "../../../utils/update_state"
import type { DerivedUIKnowledgeView } from "../../derived/State"
import type { RootState } from "../../State"
import { get_base_knowledge_view } from "../accessors"
import type {
    KnowledgeView,
    KnowledgeViewWComponentIdEntryMap,
} from "../../../shared/wcomponent/interfaces/knowledge_view"
import { get_wcomponent_ids_by_type } from "../../derived/get_wcomponent_ids_by_type"



export const knowledge_views_derived_reducer = (initial_state: RootState, state: RootState): RootState =>
{

    const one_or_more_knowledge_views_changed = initial_state.specialised_objects.knowledge_views_by_id !== state.specialised_objects.knowledge_views_by_id
    if (one_or_more_knowledge_views_changed)
    {
        state = update_derived_knowledge_view_state(state)
    }


    if (initial_state.routing.args.view === "knowledge" || state.routing.args.view === "knowledge")
    {
        const initial_kv_id = initial_state.routing.args.subview_id
        const current_kv_id = state.routing.args.subview_id
        const kv_object_id_changed = initial_kv_id !== current_kv_id
        if (kv_object_id_changed)
        {
            state = update_substate(state, "derived", "current_UI_knowledge_view", undefined)
        }


        const initial_kv = get_knowledge_view(initial_state, initial_kv_id)
        const current_kv = get_knowledge_view(state, current_kv_id)
        const kv_object_changed = initial_kv !== current_kv

        const one_or_more_wcomponents_changed = initial_state.specialised_objects.wcomponents_by_id !== state.specialised_objects.wcomponents_by_id

        const need_update = kv_object_changed || one_or_more_wcomponents_changed


        if (need_update)
        {
            const current_UI_knowledge_view = update_UI_current_knowledge_view_state(initial_state, state, current_kv)
            state = update_substate(state, "derived", "current_UI_knowledge_view", current_UI_knowledge_view)
        }
    }


    return state
}



function update_derived_knowledge_view_state (state: RootState): RootState
{
    const knowledge_views = sort_list(
        Object.values(state.specialised_objects.knowledge_views_by_id),
        ({ created_at }) => created_at.getTime(),
        "ascending"
    )
    state = update_substate(state, "derived", "knowledge_views", knowledge_views)


    const {
        base_knowledge_view,
        other_knowledge_views,
    } = get_base_knowledge_view(state)

    state = {
        ...state,
        derived: {
            ...state.derived,
            base_knowledge_view,
            other_knowledge_views,
        },
    }

    return state
}



function get_knowledge_view (state: RootState, id: string)
{
    return state.specialised_objects.knowledge_views_by_id[id]
}



function update_UI_current_knowledge_view_state (intial_state: RootState, state: RootState, current_kv?: KnowledgeView)
{
    if (!current_kv) return undefined

    const derived_wc_id_map = get_derived_wc_id_map(current_kv, intial_state, state)
    const wc_id_counterfactuals_map = get_wc_id_counterfactuals_map(state, current_kv)
    const wc_ids_by_type = get_wcomponent_ids_by_type(state, Object.keys(derived_wc_id_map))

    const current_UI_knowledge_view: DerivedUIKnowledgeView = {
        ...current_kv,
        derived_wc_id_map,
        wc_id_counterfactuals_map,
        wc_ids_by_type,
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



function get_wc_id_counterfactuals_map (state: RootState, knowledge_view: KnowledgeView): WcIdCounterfactualsMap
{
    const map: WcIdCounterfactualsMap = {}

    Object.keys(knowledge_view.wc_id_map).forEach(wcomponent_id =>
    {
        const counterfactual = state.specialised_objects.wcomponents_by_id[wcomponent_id]
        if (!counterfactual || !wcomponent_is_counterfactual(counterfactual)) return

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
