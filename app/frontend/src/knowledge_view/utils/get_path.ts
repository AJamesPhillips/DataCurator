import type { NestedKnowledgeViewEntry, NestedKnowledgeViewsMap } from "../../state/derived/State"



export function get_path (nested_kv_map: NestedKnowledgeViewsMap, kv_id: string)
{
    const path: NestedKnowledgeViewEntry[] = []

    let entry = nested_kv_map[kv_id]

    while (entry)
    {
        path.unshift(entry)
        entry = nested_kv_map[entry.parent_id || ""]
    }

    return path
}
