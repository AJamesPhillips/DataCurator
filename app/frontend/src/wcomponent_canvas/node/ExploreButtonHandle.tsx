import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import SearchIcon from "@mui/icons-material/Search"
import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"
import type { Store } from "redux"

import {
    get_new_knowledge_view_object,
    navigate_to_knowledge_view_or_kvwcomponent,
} from "../../knowledge_view/create_new_knowledge_view"
import type { HasBaseId } from "../../shared/interfaces/base"
import type {
    KnowledgeView,
    KnowledgeViewWComponentEntry,
    KnowledgeViewWComponentIdEntryMap,
} from "../../shared/interfaces/knowledge_view"
import { get_today_str } from "../../shared/utils/date_helpers"
import { AddSearchIcon } from "../../sharedf/icons/AddSearchIcon"
import { get_title, RichTextType } from "../../sharedf/rich_text/get_rich_text"
import { remove_rich_text } from "../../sharedf/rich_text/remove_rich_text"
import { ACTIONS } from "../../state/actions"
import { get_overlapping_wcomponent_ids, get_wc_id_to_counterfactuals_v2_map } from "../../state/derived/accessor"
import { get_middle_of_screen } from "../../state/display_options/display"
import { get_current_composed_knowledge_view_from_state, get_wcomponent_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { get_store } from "../../state/store"
import "./Handles.scss"



export interface ExploreButtonHandleOwnProps
{
    wcomponent_id: string
    wcomponent_current_kv_entry?: KnowledgeViewWComponentEntry
    is_highlighted: boolean
}



const map_state = (state: RootState, own_props: ExploreButtonHandleOwnProps) =>
{
    const wcomponent = get_wcomponent_from_state(state, own_props.wcomponent_id)

    const overlapping_wcomponent_ids = get_overlapping_wcomponent_ids(state, own_props.wcomponent_id) || []
    const any_overlapping_wcomponents_have_kvs = overlapping_wcomponent_ids.find(id => state.specialised_objects.knowledge_views_by_id[id])

    return {
        wcomponent,
        kvwc: state.specialised_objects.knowledge_views_by_id[own_props.wcomponent_id],
        subview_id: state.routing.args.subview_id,
        nested_knowledge_view_ids_entry: state.derived.nested_knowledge_view_ids.map[own_props.wcomponent_id],
        presenting: state.display_options.consumption_formatting,
        any_overlapping_wcomponents_have_kvs,
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & ExploreButtonHandleOwnProps



function _ExploreButtonHandle (props: Props)
{
    let { kvwc } = props
    const {
        is_highlighted,
        nested_knowledge_view_ids_entry: nested_map,
        any_overlapping_wcomponents_have_kvs,
    } = props

    const is_editing = !props.presenting
    const hidden = !kvwc && (props.presenting || (is_editing && !is_highlighted && !any_overlapping_wcomponents_have_kvs))

    const is_current_knowledge_view = props.subview_id === props.wcomponent_id
    const parent_knowledge_view_id = nested_map && nested_map.parent_id
    const enable_creating_new_kv = is_editing && !!props.wcomponent

    const click_outcome = is_current_knowledge_view ? (
            parent_knowledge_view_id
                ? ClickOutComes.navigate_up_to_kv_parent
                : ClickOutComes.disabled__current_but_no_parent
        ) : kvwc
            ? ClickOutComes.navigate_to_kv
            : enable_creating_new_kv
                ? ClickOutComes.create_then_navigate
                : ClickOutComes.disabled__need_component_to_create_then_navigate

    const current_but_no_parent = is_current_knowledge_view && !parent_knowledge_view_id

    const class_name = `node_handle explore `
        + (hidden ? " hidden " : "")
        + (kvwc ? " has_knowledge_view " : "")
        + (current_but_no_parent ? " current_but_no_parent " : "")
        // + (click_outcome < 0 ? "" : " highlight_on_hover ")
        + (click_outcome === ClickOutComes.create_then_navigate ? " will_create_on_click " : "")
        + (click_outcome === ClickOutComes.disabled__need_component_to_create_then_navigate ? " error_disabled " : "")

    const title = click_outcome === ClickOutComes.navigate_up_to_kv_parent ? "Navigate up to parent"
        : click_outcome === ClickOutComes.disabled__current_but_no_parent ? "No parent to navigate up to"
        : click_outcome === ClickOutComes.navigate_to_kv ? "Navigate to knowledge view"
        : click_outcome === ClickOutComes.create_then_navigate ? "Create then navigate to knowledge view"
        : click_outcome === ClickOutComes.disabled__need_component_to_create_then_navigate ? "Error: could not find the component to create a new knowledge view for"
        : "Unknown error"

    return <div
        className={class_name}
        title={title}
        onClick={e => // using onClick so that WComponentForm input onBlur functions can fire
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
                    const success = prepare_wcomponent_knowledge_view(props, store)
                    if (!success) return

                    kvwc = success

                    store.dispatch(ACTIONS.specialised_object.upsert_knowledge_view({ knowledge_view: kvwc }))
                }

                navigate_to_knowledge_view_or_kvwcomponent(kvwc.id, store)
            }
        }}
    >
        {is_current_knowledge_view
            ? <ArrowUpwardIcon />
            : (click_outcome === ClickOutComes.create_then_navigate
                ? <AddSearchIcon />
                : <SearchIcon />)}
    </div>
}

export const ExploreButtonHandle = connector(_ExploreButtonHandle) as FunctionalComponent<ExploreButtonHandleOwnProps>



enum ClickOutComes
{
    disabled__current_but_no_parent = -1,
    navigate_to_kv = 1,
    navigate_up_to_kv_parent = 2,
    disabled__need_component_to_create_then_navigate = -2,
    create_then_navigate = 3,
}



function prepare_wcomponent_knowledge_view (props: Props, store: Store<RootState>)
{
    if (!props.wcomponent) return false

    const state = store.getState()
    const middle_of_screen = get_middle_of_screen(state)

    const wc_id_map: KnowledgeViewWComponentIdEntryMap = {
        [props.wcomponent.id]: props.wcomponent_current_kv_entry || middle_of_screen,
    }

    const rendered_title = get_title({
        wcomponent: props.wcomponent,
        wc_id_to_counterfactuals_map: get_wc_id_to_counterfactuals_v2_map(state),
        text_type: RichTextType.plain,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
    })
    const rendered_title_with_less_rich_text = remove_rich_text(rendered_title)
    const title = rendered_title_with_less_rich_text || `Knowledge view for ${props.wcomponent.id} created: ${get_today_str()}`


    const current_kv = get_current_composed_knowledge_view_from_state(state)
    const current_kv_id = current_kv && current_kv.id


    const partial_knowledge_view_wcomponent: Partial<KnowledgeView> & HasBaseId = {
        id: props.wcomponent.id,
        base_id: props.wcomponent.base_id,
        wc_id_map,
        title,
        sort_type: current_kv_id ? "normal" : "hidden", // todo document what the logic is doing here
        parent_knowledge_view_id: current_kv_id,
    }


    const { creation_context } = state
    return get_new_knowledge_view_object(partial_knowledge_view_wcomponent, creation_context)
}
