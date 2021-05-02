import type { KnowledgeView } from "../shared/models/interfaces/SpecialisedObjects"
import { get_new_knowledge_view_id } from "../utils/utils"



export function create_new_knowledge_view (args: Partial<KnowledgeView> = {})
{
    const knowledge_view: KnowledgeView = {
        id: get_new_knowledge_view_id(),
        created_at: new Date(),
        title: "",
        description: "",
        wc_id_map: {},
        counterfactual_layer_id_map: {},
        ...args,
    }

    return knowledge_view
}
