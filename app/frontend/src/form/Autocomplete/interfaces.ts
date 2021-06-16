import type { h } from "preact"



// namespace AutocompleteText
// {
interface BaseAutocompleteOption
{
    id: string | undefined
    title: string
    jsx?: h.JSX.Element
    subtitle?: string
}
export interface InternalAutocompleteOption extends BaseAutocompleteOption
{
    total_text: string
}
export interface AutocompleteOption extends BaseAutocompleteOption
{
    id: string
}
// }
