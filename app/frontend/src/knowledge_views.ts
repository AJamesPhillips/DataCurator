import type { KnowledgeView } from "./shared/interfaces/knowledge_view"
import { parse_knowledge_view } from "./wcomponent/parse_json/parse_knowledge_view"



export const knowledge_views: KnowledgeView[] = [
    // knowledge_views objects here...
    // {id: "1234...8", ...},
    // ... etc
].map(kv =>
{
    const ok_kv: KnowledgeView = parse_knowledge_view({
        ...kv,
        base_id: 14,
    } as any)

    return ok_kv
})
