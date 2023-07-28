import type { KnowledgeViewsById } from "../../shared/interfaces/knowledge_view"
import type { WComponentsById, WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"



export interface ReplaceNormalIdsInTextArgs
{
    wcomponents_by_id: WComponentsById
    depth_limit: number
    render_links: boolean
    root_url: string
    get_title: (wcomponent: WComponent) => string
}



export interface ReplaceFunctionIdsInTextArgs
{
    wcomponents_by_id: WComponentsById
    knowledge_views_by_id: KnowledgeViewsById
    depth_limit: number
    render_links: boolean
    root_url: string
    get_title: (wcomponent: WComponent) => string
}
