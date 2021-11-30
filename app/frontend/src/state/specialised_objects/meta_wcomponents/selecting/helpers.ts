import { WComponentsById, wcomponent_is_causal_link } from "../../../../wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../../../actions"
import type { ComposedKnowledgeView } from "../../../derived/State"
import type { StoreType } from "../../../store"
import { get_current_composed_knowledge_view_from_state } from "../../accessors"



export const conditionally_select_all_components = factory_conditionally_select_components(
    composed_kv =>
{
    return Object.keys(composed_kv.composed_visible_wc_id_map)
})



export const conditionally_expand_selected_components = factory_conditionally_select_components(
    (composed_kv, selected_ids) =>
{
    const new_selected_ids = [...selected_ids]
    const new_selected_ids_set = new Set(new_selected_ids)

    const { wc_id_connections_map, composed_visible_wc_id_map } = composed_kv

    selected_ids.forEach(id =>
    {
        const connected_ids = wc_id_connections_map[id]
        if (!connected_ids) return

        connected_ids.forEach(connected_id =>
        {
            if (new_selected_ids_set.has(connected_id)) return
            if (!composed_visible_wc_id_map[id]) return

            new_selected_ids.push(connected_id)
            new_selected_ids_set.add(connected_id)
        })
    })

    return new_selected_ids
})



export const conditionally_contract_selected_components = factory_conditionally_select_components(
    (composed_kv, selected_ids) =>
{
    const selected_ids_set = new Set(selected_ids)
    const selected_ids_to_remove = new Set<string>()

    const { wc_id_connections_map, composed_visible_wc_id_map } = composed_kv

    selected_ids.forEach(id =>
    {
        const connected_ids = wc_id_connections_map[id]

        if (!connected_ids) selected_ids_to_remove.add(id)
        else
        {
            const connected_and_selected_ids = Array.from(connected_ids)
                .filter(id => composed_visible_wc_id_map[id])
                .filter(id => selected_ids_set.has(id))
            if (connected_and_selected_ids.length <= 1) selected_ids_to_remove.add(id)
        }
    })

    return selected_ids.filter(id => !selected_ids_to_remove.has(id))
})



export const conditionally_select_forward_causal_components = factory_conditionally_select_causal_components("forward")

export const conditionally_select_source_causal_components = factory_conditionally_select_causal_components("source")


function factory_conditionally_select_causal_components (direction: "forward" | "source")
{
    const forward = direction === "forward"

    return factory_conditionally_select_components((composed_kv, selected_ids, wcomponents_by_id) =>
    {
        const new_selected_ids = [...selected_ids]
        const new_selected_ids_set = new Set(new_selected_ids)

        function add_id (id: string)
        {
            if (new_selected_ids_set.has(id)) return

            new_selected_ids_set.add(id)
            new_selected_ids.push(id)
        }


        const { wc_id_connections_map, composed_visible_wc_id_map } = composed_kv

        selected_ids.forEach(id =>
        {
            const connected_ids = wc_id_connections_map[id]
            if (!connected_ids) return

            const causal_links = Array.from(connected_ids).concat([id])
                .filter(id => composed_visible_wc_id_map[id])
                .map(id => wcomponents_by_id[id])
                .filter(wcomponent_is_causal_link)
                .filter(wc => (forward ? wc.from_id : wc.to_id) === id || wc.id === id)

            causal_links.forEach(({ id, from_id, to_id }) =>
            {
                add_id(id)
                add_id((forward ? to_id : from_id))
            })
        })

        return new_selected_ids
    })
}



export const conditionally_select_interconnections = factory_conditionally_select_components(
    (composed_kv, selected_ids) =>
{
    const initial_selected_ids_set = new Set(selected_ids)
    const new_selected_ids = [...selected_ids]
    const new_selected_ids_set = new Set(new_selected_ids)

    const { wc_id_connections_map, composed_visible_wc_id_map } = composed_kv


    function is_not_visible (id: string)
    {
        return !composed_visible_wc_id_map[id]
            // These checks are not needed because they have already occured
            // || composed_visible_wc_id_map[id]?.blocked
            // || composed_visible_wc_id_map[id]?.passthrough
    }


    selected_ids.forEach(id =>
    {
        // Defensive: conditional maybe needed because although this is already a selected component
        // it may not be visible, i.e. it might have been selected on a different knowledge view
        if (is_not_visible(id)) return

        const connected_ids_first_degree = wc_id_connections_map[id]
        if (!connected_ids_first_degree) return

        connected_ids_first_degree.forEach(connected_id_1st_degree =>
        {
            if (is_not_visible(connected_id_1st_degree)) return

            const connected_ids_second_degree = wc_id_connections_map[connected_id_1st_degree]
            if (!connected_ids_second_degree) return

            connected_ids_second_degree.forEach(connected_id_second_degree =>
            {
                if (connected_id_second_degree === id) return
                if (!initial_selected_ids_set.has(connected_id_second_degree)) return
                // Conditional needed because although this is already a selected component
                // it may not be visible, i.e. it might have been selected on a different knowledge view
                if (is_not_visible(connected_id_second_degree)) return

                if (new_selected_ids_set.has(connected_id_1st_degree)) return
                new_selected_ids.push(connected_id_1st_degree)
                new_selected_ids_set.add(connected_id_1st_degree)
            })
        })
    })

    return new_selected_ids
})



function factory_conditionally_select_components (get_component_ids: (composed_kv: ComposedKnowledgeView, selected_ids: string[], wcomponents_by_id: WComponentsById) => string[])
{
    return (store: StoreType) =>
    {
        const state = store.getState()
        const composed_kv = get_current_composed_knowledge_view_from_state(state)
        if (!composed_kv) return

        const viewing_knowledge = state.routing.args.view === "knowledge"
        if (!viewing_knowledge) return

        const selected_ids = state.meta_wcomponents.selected_wcomponent_ids_list
        const { wcomponents_by_id } = state.specialised_objects
        const ids = get_component_ids(composed_kv, selected_ids, wcomponents_by_id)

        store.dispatch(ACTIONS.specialised_object.set_selected_wcomponents({ ids }))
        store.dispatch(ACTIONS.routing.change_route({ sub_route: "wcomponents_edit_multiple", item_id: null }))
    }
}
