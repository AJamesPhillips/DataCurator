import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import {
    get_new_knowledge_view_object,
    navigate_to_kvwcomponent,
} from "../../knowledge_view/create_new_knowledge_view"
import { get_today_str } from "../../shared/utils/date_helpers"
import type {
    KnowledgeViewWComponentIdEntryMap,
    KnowledgeView,
    KnowledgeViewWComponentEntry,
} from "../../shared/wcomponent/interfaces/knowledge_view"
import type { WComponent } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { get_store } from "../../state/store"



export interface ExploreButtonHandleOwnProps
{
    wcomponent: WComponent
    wcomponent_current_kv_entry: KnowledgeViewWComponentEntry
    editing: boolean
}



const map_state = (state: RootState, own_props: ExploreButtonHandleOwnProps) =>
{
    const kvwc_id = wcomponent_id_to_wcomponent_kv_id(own_props.wcomponent.id)

    return {
        kvwc_id,
        kvwc: state.specialised_objects.knowledge_views_by_id[kvwc_id]
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & ExploreButtonHandleOwnProps



function _ExploreButtonHandle (props: Props)
{
    let { kvwc } = props

    return <div
        className={`node_handle explore ${kvwc ? "has_nested_knowledge_view" : ""}`}
        onPointerDown={() =>
        {
            const store = get_store()

            if (!kvwc)
            {
                const wc_id_map: KnowledgeViewWComponentIdEntryMap = {
                    [props.wcomponent.id]: props.wcomponent_current_kv_entry,
                }
                const title = "Knowledge View for: " + (props.wcomponent.title || `World Component ${props.wcomponent.id} created: ${get_today_str()}`)
                const partial_knowledge_view_wcomponent: Partial<KnowledgeView> = {
                    id: props.kvwc_id, wc_id_map, title, sort_type: "hidden",
                }

                // Optimisisation, only need the creation_context if creating a new knowledge view
                const { creation_context } = store.getState()

                kvwc = get_new_knowledge_view_object(partial_knowledge_view_wcomponent, creation_context)

                store.dispatch(ACTIONS.specialised_object.upsert_knowledge_view({ knowledge_view: kvwc }))
            }

            navigate_to_kvwcomponent(kvwc.id, store)
        }}
    >&#128269;</div>
}

export const ExploreButtonHandle = connector(_ExploreButtonHandle) as FunctionalComponent<ExploreButtonHandleOwnProps>



const wcomponent_id_to_wcomponent_kv_id = (id: string) => "kv" + id
