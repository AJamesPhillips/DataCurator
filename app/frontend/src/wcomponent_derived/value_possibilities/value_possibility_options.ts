import type { AutocompleteOption } from "../../form/Autocomplete/interfaces"
import { sentence_case } from "../../shared/utils/sentence_case"
import type { ValuePossibilitiesById } from "../../wcomponent/interfaces/possibility"



export function value_possibility_options (value_possibilities: ValuePossibilitiesById | undefined, default_options: AutocompleteOption[]): AutocompleteOption[]
{
    return value_possibilities === undefined
        ? default_options
        : Object.values(value_possibilities).map(({ value }) => ({ id: value, title: sentence_case(value) }))
}
