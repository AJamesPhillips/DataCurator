import type { KnowledgeView } from "../interfaces/knowledge_view"
import type { SpecialisedObjectsFromToServer, Perception, WComponent } from "../interfaces/SpecialisedObjects"
import { parse_dates } from "./parse_dates"
import { parse_knowledge_view } from "./parse_knowledge_view"
import { parse_wcomponent } from "./parse_wcomponent"



export function parse_specialised_objects_fromto_server (data: SpecialisedObjectsFromToServer)
{
    const expected_specialised_object_keys = new Set([
        "perceptions",
        "wcomponents",
        "knowledge_views",
        "wcomponent_ids_to_delete",
    ])

    const data_keys = Object.keys(data)

    const extra = data_keys.filter(k => !expected_specialised_object_keys.has(k as any))
    if (extra.length) throw new Error(`Unexpected keys "${extra.join(", ")}" in specialised objects state`)

    const missing = Array.from(expected_specialised_object_keys).filter(k => !data.hasOwnProperty(k))
    if (missing.length) throw new Error(`Expected keys "${missing.join(", ")}" missing in specialised objects state`)

    const perceptions: Perception[] = data.perceptions.map(parse_perception)
    const wcomponents: WComponent[] = data.wcomponents.map(parse_wcomponent)
    const wcomponent_ids = new Set(wcomponents.map(({ id }) => id))
    const knowledge_views: KnowledgeView[] = data.knowledge_views.map(kv => parse_knowledge_view(kv, wcomponent_ids))
    const wcomponent_ids_to_delete = data.wcomponent_ids_to_delete

    const specialised_objects: SpecialisedObjectsFromToServer = {
        perceptions,
        wcomponents,
        knowledge_views,
        wcomponent_ids_to_delete,
    }

    return specialised_objects
}



const parse_perception = (perception: Perception) => parse_dates(perception)

