import type { KnowledgeView } from "../../interfaces/knowledge_view"
import type { SpecialisedObjectsFromToServer, Perception, WComponent } from "../interfaces/SpecialisedObjects"
import { parse_base_dates } from "./parse_dates"
import { parse_knowledge_view } from "./parse_knowledge_view"
import { parse_wcomponent } from "./parse_wcomponent"



export function parse_specialised_objects_fromto_server (data: SpecialisedObjectsFromToServer | null)
{
    const expected_specialised_object_keys = new Set([
        "perceptions",
        "wcomponents",
        "knowledge_views",
    ])

    let perceptions: Perception[] = []
    let wcomponents: WComponent[] = []
    let knowledge_views: KnowledgeView[] = []

    if (data)
    {
        delete (data as any).wcomponent_ids_to_delete  // Can remove this once all user's data is cleared of this attribute
        const data_keys = Object.keys(data)

        const extra = data_keys.filter(k => !expected_specialised_object_keys.has(k as any))
        if (extra.length) throw new Error(`Unexpected keys "${extra.join(", ")}" in specialised objects state`)

        const missing = Array.from(expected_specialised_object_keys).filter(k => !data.hasOwnProperty(k))
        if (missing.length) throw new Error(`Expected keys "${missing.join(", ")}" missing in specialised objects state`)

        perceptions = data.perceptions.map(parse_perception)
        wcomponents = data.wcomponents.map(parse_wcomponent)
        const wcomponent_ids = new Set(wcomponents.map(({ id }) => id))
        knowledge_views = data.knowledge_views.map(kv => parse_knowledge_view(kv, wcomponent_ids))
    }

    const specialised_objects: SpecialisedObjectsFromToServer = {
        perceptions,
        wcomponents,
        knowledge_views,
    }

    return specialised_objects
}



const parse_perception = (perception: Perception) => parse_base_dates(perception)

