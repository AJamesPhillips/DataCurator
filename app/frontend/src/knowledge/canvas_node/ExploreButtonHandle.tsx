import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import type { Store } from "redux"

import {
    get_new_knowledge_view_object,
    navigate_to_knowledge_view_or_kvwcomponent,
} from "../../knowledge_view/create_new_knowledge_view"
import { get_today_str } from "../../shared/utils/date_helpers"
import type {
    KnowledgeViewWComponentIdEntryMap,
    KnowledgeView,
    KnowledgeViewWComponentEntry,
} from "../../shared/wcomponent/interfaces/knowledge_view"
import type { WComponent } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_title } from "../../shared/wcomponent/rich_text/get_rich_text"
import { ACTIONS } from "../../state/actions"
import { get_wc_id_counterfactuals_map } from "../../state/derived/accessor"
import { get_current_UI_knowledge_view_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { get_store } from "../../state/store"



export interface ExploreButtonHandleOwnProps
{
    wcomponent: WComponent
    wcomponent_current_kv_entry: KnowledgeViewWComponentEntry
    is_highlighted: boolean
}



const map_state = (state: RootState, own_props: ExploreButtonHandleOwnProps) =>
{
    const kvwc_id = wcomponent_id_to_wcomponent_kv_id(own_props.wcomponent.id)

    return {
        kvwc_id,
        kvwc: state.specialised_objects.knowledge_views_by_id[kvwc_id],
        subview_id: state.routing.args.subview_id,
        nested_knowledge_view_ids_entry: state.derived.nested_knowledge_view_ids.map[kvwc_id],
        presenting: state.display_options.consumption_formatting,
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & ExploreButtonHandleOwnProps



function _ExploreButtonHandle (props: Props)
{
    let { kvwc, is_highlighted, nested_knowledge_view_ids_entry: nested_map } = props

    if (props.presenting ? !kvwc : !is_highlighted) return null

    const is_current_knowledge_view = props.subview_id === props.kvwc_id
    const parent_knowledge_view_id = nested_map && nested_map.parent_id
    const current_but_no_parent = is_current_knowledge_view && !parent_knowledge_view_id

    const class_name = `node_handle explore `
        + (kvwc ? " has_nested_knowledge_view " : "")
        + (current_but_no_parent ? " current_but_no_parent " : "")

    return <div
        className={class_name}
        onPointerDown={e =>
        {
            e.preventDefault()
            e.stopImmediatePropagation()

            const store = get_store()

            if (is_current_knowledge_view)
            {
                if (parent_knowledge_view_id)
                {
                    navigate_to_knowledge_view_or_kvwcomponent(parent_knowledge_view_id, store)
                }
            }
            else
            {

                if (!kvwc)
                {
                    kvwc = prepare_wcomponent_knowledge_view(props, store)

                    store.dispatch(ACTIONS.specialised_object.upsert_knowledge_view({ knowledge_view: kvwc }))
                }

                navigate_to_knowledge_view_or_kvwcomponent(kvwc.id, store)
            }
        }}
    >
        {is_current_knowledge_view
            ? <span>&#8593;</span>
            : <span>&#128269;</span>}
    </div>
}

export const ExploreButtonHandle = connector(_ExploreButtonHandle) as FunctionalComponent<ExploreButtonHandleOwnProps>



const wcomponent_id_to_wcomponent_kv_id = (id: string) => "kv" + id



function prepare_wcomponent_knowledge_view(props: Props, store: Store<RootState>)
{
    const wc_id_map: KnowledgeViewWComponentIdEntryMap = {
        [props.wcomponent.id]: props.wcomponent_current_kv_entry,
    }

    const state = store.getState()


    const rendered_title = get_title({
        wcomponent: props.wcomponent,
        wc_id_counterfactuals_map: get_wc_id_counterfactuals_map(state),
        rich_text: true,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
    })
    const title = rendered_title || `World Component ${props.wcomponent.id} created: ${get_today_str()}`


    const current_kv = get_current_UI_knowledge_view_from_state(state)
    const current_kv_id = current_kv && current_kv.id


    const partial_knowledge_view_wcomponent: Partial<KnowledgeView> = {
        id: props.kvwc_id,
        wc_id_map,
        title,
        sort_type: current_kv_id ? "normal" : "hidden",
        parent_knowledge_view_id: current_kv_id,
    }


    const { creation_context } = state
    return get_new_knowledge_view_object(partial_knowledge_view_wcomponent, creation_context)
}
