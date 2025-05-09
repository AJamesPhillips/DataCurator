import type { CertaintyFormattingOption, CertaintyFormattingTypes, ValidityFilterOption, ValidityFilterTypes } from "./state"



export function derive_validity_filter (validity_filter: ValidityFilterTypes)
{
    const derived_validity_filter: ValidityFilterOption = {
        only_certain_valid: validity_filter === "only_certain_valid",
        only_maybe_valid: validity_filter === "only_maybe_valid",
        maybe_invalid: validity_filter === "maybe_invalid",
        show_invalid: validity_filter === "show_invalid",
    }

    return derived_validity_filter
}



export function derive_certainty_formatting (certainty_formatting: CertaintyFormattingTypes)
{
    const derived_certainty_formatting: CertaintyFormattingOption = {
        render_certainty_as_opacity: certainty_formatting === "render_certainty_as_opacity",
        render_certainty_as_easier_opacity: certainty_formatting === "render_certainty_as_easier_opacity",
        render_100_opacity: certainty_formatting === "render_100_opacity",
    }

    return derived_certainty_formatting
}
