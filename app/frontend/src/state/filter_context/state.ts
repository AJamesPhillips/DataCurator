import type { WComponentType } from "../../wcomponent/interfaces/wcomponent_base"



export interface FilterContextState
{
    apply_filter: boolean
    filters: FilterContextFilters
}



export interface FilterContextFilters
{
    exclude_by_label_ids: string[]
    include_by_label_ids: string[]
    exclude_by_component_types: WComponentType[]
    include_by_component_types: WComponentType[]
    // Actions list filters
    filter_by_current_knowledge_view: boolean
    filter_by_text: string
}
