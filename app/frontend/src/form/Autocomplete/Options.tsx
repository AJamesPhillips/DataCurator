import { h } from "preact"

import type { InternalAutocompleteOption } from "./interfaces"



interface OwnProps
{
    editing_options: boolean
    options_to_display: InternalAutocompleteOption[]
    is_option_wrapper_highlighted: (option: InternalAutocompleteOption, index: number) => boolean
    conditional_on_change: (option_id: string | undefined) => void
    set_highlighted_option_index: (index: number) => void
    on_mouse_over_option: (option_id: string | undefined) => void
    on_mouse_leave_option: (option_id: string | undefined) => void
}



export function Options (props: OwnProps)
{
    const { editing_options, options_to_display, is_option_wrapper_highlighted, conditional_on_change,
        set_highlighted_option_index, on_mouse_over_option, on_mouse_leave_option, } = props

    if (options_to_display.length === 0 || !editing_options) return null

    return <div className="options_outer" style={{ marginTop: 15 }}>
        <div className="options_inner">
            {options_to_display.map((option, index) => <div
                className={"option_wrapper " + (is_option_wrapper_highlighted(option, index) ? " highlighted " : "")}
                onMouseDown={() => conditional_on_change(option.id)}
                onMouseOver={() => {
                    set_highlighted_option_index(index)
                    on_mouse_over_option(option.id)
                }}
                onMouseLeave={() => on_mouse_leave_option(option.id)}
            >
                <div className="option">
                    {option.jsx || option.title || option.id || "none"}
                    <div className="option_subtitle">{option.subtitle}</div>
                </div>
            </div>)}
        </div>
    </div>
}
