import type { Project } from "../../wcomponent/interfaces/project"
import type { Base } from "./base"
import type { Color } from "./color"
import type { DatetimeLineConfig } from "./datetime_lines"



export type KnowledgeViewTreeSortType = "priority" | "normal" | "hidden" | "archived" | "errored"
export const knowledge_view_tree_sort_types: KnowledgeViewTreeSortType[] = ["priority", "normal", "hidden", "archived"]



export interface KnowledgeViewWComponentIdEntryMap {
    [world_component_id: string]: KnowledgeViewWComponentEntry
}



export interface KnowledgeView extends Base, Project {
    // Explainable
    title: string
    description: string

    wc_id_map: KnowledgeViewWComponentIdEntryMap
    // Used for sharing data
    foundation_knowledge_view_ids?: string[]
    // Used for semantically organising knowledge views in relation to each other
    parent_knowledge_view_id?: string
    sort_type: KnowledgeViewTreeSortType

    active_counterfactual_v2_ids?: string[]

    datetime_line_config?: DatetimeLineConfig
}



export type KnowledgeViewsById = { [id: string]: KnowledgeView /*| undefined*/ }


export interface KnowledgeViewWComponentEntry {
    // TODO remove left and top and abstract over the upside down browser coordinate system by using x and y
    left: number
    top: number
    s?: number
    blocked?: true
    passthrough?: true
    frame_width?: number
    frame_height?: number
    frame_color?: Color
}
