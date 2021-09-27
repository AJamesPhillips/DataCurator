import type { Store } from "redux"

import type { KnowledgeView } from "../shared/interfaces/knowledge_view"
import { get_new_knowledge_view_id, is_wc_knowledge_view_id } from "../shared/utils/ids"
import { get_new_created_ats } from "../shared/utils/datetime"
import type { CreationContextState } from "../shared/creation_context/state"
import { get_store } from "../state/store"
import type { RootState } from "../state/State"
import { ACTIONS } from "../state/actions"



export function get_new_knowledge_view_object (args: Partial<KnowledgeView> = {}, creation_context?: CreationContextState)
{
    const knowledge_view: KnowledgeView = {
        id: get_new_knowledge_view_id(),
        ...get_new_created_ats(creation_context),
        title: "",
        description: "",
        wc_id_map: {},
        goal_ids: [],
        sort_type: "normal",
        ...args,
    }

    return knowledge_view
}



interface CreateKnowledgeViewArgs
{
    knowledge_view: Partial<KnowledgeView>
    creation_context: CreationContextState | undefined
    store?: Store<RootState>
}

export function create_new_knowledge_view (args: CreateKnowledgeViewArgs)
{
    const store = args.store || get_store()

    const knowledge_view = get_new_knowledge_view_object(args.knowledge_view, args.creation_context)

    store.dispatch(ACTIONS.specialised_object.upsert_knowledge_view({ knowledge_view }))
}



export function navigate_to_knowledge_view_or_kvwcomponent (kv_or_kvwc_id: string, store: Store<RootState>)
{
    store.dispatch(ACTIONS.routing.change_route({
        route: "wcomponents",
        // item_id: wc_id,
        args: { subview_id: kv_or_kvwc_id },
    }))
}
