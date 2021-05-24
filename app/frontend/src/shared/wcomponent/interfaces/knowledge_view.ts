


export interface KnowledgeView {
    id: string;
    created_at: Date;
    title: string;
    description: string;
    wc_id_map: KnowledgeViewWComponentIdEntryMap;
    is_base?: true;
    allows_assumptions?: true;
    foundation_knowledge_view_ids?: string[];
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
