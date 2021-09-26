import type { Base } from "../../interfaces/base"
import type { Project } from "./project"



export type KnowledgeViewSortType = "priority" | "normal" | "hidden" | "archived"
export const knowledge_view_sort_types: KnowledgeViewSortType[] = ["priority", "normal", "hidden", "archived"]


export interface KnowledgeView extends Base, Project {
    // Explainable
    title: string
    description: string

    wc_id_map: KnowledgeViewWComponentIdEntryMap
    is_base?: true
    // Used for sharing data
    foundation_knowledge_view_ids?: string[]
    // Used for semantically organising knowledge views in relation to each other
    parent_knowledge_view_id?: string
    sort_type: KnowledgeViewSortType
    active_counterfactual_v2_ids?: string[]
}



export type KnowledgeViewsById = { [id: string]: KnowledgeView /*| undefined*/ }


export interface KnowledgeViewWComponentEntry {
    // TODO remove left and top and abstract over the upside down browser coordinate system by using x and y
    left: number
    top: number

    deleted?: true
}


export interface KnowledgeViewWComponentIdEntryMap {
    [world_component_id: string]: KnowledgeViewWComponentEntry
}
