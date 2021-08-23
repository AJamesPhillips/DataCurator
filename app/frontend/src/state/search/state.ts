


export type SearchFields = "title" | "all"
export type SearchType = "exact" | "fuzzy" | "best"


export interface SearchState
{
    search_fields: SearchFields
    search_type: SearchType
}
