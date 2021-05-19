import type { KnowledgeView } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_new_knowledge_view_id } from "../shared/utils/ids"



export function create_new_knowledge_view (args: Partial<KnowledgeView> = {})
{
    const knowledge_view: KnowledgeView = {
        id: get_new_knowledge_view_id(),
        created_at: new Date(),
        title: "",
        description: "",
        wc_id_map: {},
        ...args,
    }

    return knowledge_view
}
