import type { ValidityFilterOption, ValidityFilterTypes } from "./state"



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