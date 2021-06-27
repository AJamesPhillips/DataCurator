import type { h } from "preact"

import type { Color } from "../../shared/interfaces"



// namespace AutocompleteText
// {
interface BaseAutocompleteOption
{
    id: string | undefined
    title: string
    is_hidden?: boolean
    jsx?: h.JSX.Element
    subtitle?: string
    color?: Color
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
