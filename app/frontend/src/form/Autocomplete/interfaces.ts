import type { h } from "preact"

import type { Color } from "../../shared/interfaces/color"



// namespace AutocompleteText
// {
interface BaseAutocompleteOption
{
    id: string | undefined
    title: string
    is_hidden?: boolean
    jsx?: h.JSX.Element
    raw_title?: string
    subtitle?: string
    color?: Color
}
export interface InternalAutocompleteOption extends BaseAutocompleteOption
{
    limited_total_text: string
    unlimited_total_text: string
    id_num: number
}
export interface AutocompleteOption extends BaseAutocompleteOption
{
    id: string
}
// }
