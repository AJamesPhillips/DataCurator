import type { KnowledgeView } from "../shared/wcomponent/interfaces/knowledge_view"
import { get_new_knowledge_view_id } from "../shared/utils/ids"
import { get_created_ats } from "../shared/utils/datetime"
import type { CreationContextState } from "../shared/interfaces"



export function create_new_knowledge_view (args: Partial<KnowledgeView> = {}, creation_context: CreationContextState)
{
    const knowledge_view: KnowledgeView = {
        id: get_new_knowledge_view_id(),
        ...get_created_ats(creation_context),
        title: "",
        description: "",
        wc_id_map: {},
        ...args,
    }

    return knowledge_view
}
