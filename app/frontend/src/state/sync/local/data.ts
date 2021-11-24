import type { User } from "@supabase/gotrue-js"
import type { SpecialisedObjectsFromToServer } from "../../../wcomponent/interfaces/SpecialisedObjects"
import { parse_knowledge_view } from "../../../wcomponent/parse_json/parse_knowledge_view"
import { parse_wcomponent } from "../../../wcomponent/parse_json/parse_wcomponent"
// import { local_raw_data } from "./raw_data"
const local_raw_data = { wcomponents_by_id: {}, knowledge_views_by_id: {} }


export const local_user: User | undefined = {} as any


const { wcomponents_by_id, knowledge_views_by_id } = local_raw_data


const wcomponents = Object.values(wcomponents_by_id).map((item: any) => parse_wcomponent(item))
const knowledge_views = Object.values(knowledge_views_by_id).map((item: any) => parse_knowledge_view(item))


export const local_data: SpecialisedObjectsFromToServer = {
    perceptions: [],
    wcomponents,
    knowledge_views,
}
