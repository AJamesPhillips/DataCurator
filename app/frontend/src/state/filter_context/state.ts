import type { WComponentType } from "../../shared/wcomponent/interfaces/wcomponent_base"



export interface FilterContextState
{
    apply_filter: boolean
    filters: CompoundFilter[]
    force_display: boolean
}

type Filter = CompoundFilter | SpecificFilter


export interface CompoundFilter {
    type: "compound"
    operator: "AND" | "OR"
    operation: "include" | "exclude"
    filters: Filter[]
}


interface SpecificFilter {
    type: "specific"
    label_ids: string[]
    search_term: string
    component_types: WComponentType[]
}