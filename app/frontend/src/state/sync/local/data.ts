import type { User } from "@supabase/supabase-js"

import { KnowledgeViewsById } from "../../../shared/interfaces/knowledge_view"
import type { SpecialisedObjectsFromToServer, WComponentsById } from "../../../wcomponent/interfaces/SpecialisedObjects"
import { parse_knowledge_view } from "../../../wcomponent/parse_json/parse_knowledge_view"
import { parse_wcomponent } from "../../../wcomponent/parse_json/parse_wcomponent"
// import { local_raw_data } from "./raw_data"
interface LocalRawDataType
{
    wcomponents_by_id: WComponentsById
    knowledge_views_by_id: KnowledgeViewsById
}
const local_raw_data: LocalRawDataType = {
    wcomponents_by_id: {},
    knowledge_views_by_id: {},
}


export const local_user: User | undefined = undefined


const { wcomponents_by_id, knowledge_views_by_id } = local_raw_data


const wcomponents = Object.values(wcomponents_by_id).map(parse_wcomponent)
const knowledge_views = Object.values(knowledge_views_by_id).map(item => parse_knowledge_view(item))


export const local_data: SpecialisedObjectsFromToServer = {
    wcomponents,
    knowledge_views,
}
