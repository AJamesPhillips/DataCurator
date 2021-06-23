import type { Base } from "./base";
import type { Project } from "./project"



export interface KnowledgeView extends Base, Project {
    // Explainable
    title: string;
    description: string;

    wc_id_map: KnowledgeViewWComponentIdEntryMap;
    is_base?: true;
    allows_assumptions?: true;
    // Used for sharing data
    foundation_knowledge_view_ids?: string[];
    // Used for semantically organising knowledge views in relation to each other
    parent_knowledge_view_id?: string;
    ERROR_is_circular?: true;
}

export interface UIKnowledgeView extends KnowledgeView
{
    children: UIKnowledgeView[]
}



export type KnowledgeViewsById = { [id: string]: KnowledgeView; /*| undefined*/ };


export interface KnowledgeViewWComponentEntry {
    // TODO remove left and top and abstract over the upside down browser coordinate system by using x and y
    left: number;
    top: number;
}


export interface KnowledgeViewWComponentIdEntryMap {
    [world_component_id: string]: KnowledgeViewWComponentEntry;
}
