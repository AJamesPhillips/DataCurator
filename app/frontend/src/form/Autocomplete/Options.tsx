import { h } from "preact"

import type { InternalAutocompleteOption } from "./interfaces"



interface OwnProps
{
    editing_options: boolean
    internal_options_to_display: InternalAutocompleteOption[]
    is_option_wrapper_highlighted: (option: InternalAutocompleteOption, index: number) => boolean
    conditional_on_change: (option_id: string | undefined) => void
    set_highlighted_option_index: (index: number) => void
    on_mouse_over_option: (option_id: string | undefined) => void
    on_mouse_leave_option: (option_id: string | undefined) => void
}



export function Options (props: OwnProps)
{
    const { editing_options, internal_options_to_display, is_option_wrapper_highlighted, conditional_on_change,
        set_highlighted_option_index, on_mouse_over_option, on_mouse_leave_option, } = props

    if (internal_options_to_display.length === 0 || !editing_options) return null

    const fudge = 45

    return <div className="options_outer" style={{ marginTop: 15 }}>
        <div
            className="options_inner"
            ref={e =>
            {
                if (!e) return
                const max_height = `${document.body.clientHeight - e.clientTop - fudge}px`
                e.style.setProperty("max-height", max_height)
            }}
        >
            {internal_options_to_display.map((internal_option, index) => <div
                className={"option_wrapper " + (is_option_wrapper_highlighted(internal_option, index) ? " highlighted " : "")}
                onMouseDown={() => conditional_on_change(internal_option.id)}
                onMouseOver={() => {
                    set_highlighted_option_index(index)
                    on_mouse_over_option(internal_option.id)
                }}
                onMouseLeave={() => on_mouse_leave_option(internal_option.id)}
            >
                <div className="option">
                    {internal_option.jsx || internal_option.title || internal_option.id || "none"}
                    <div className="option_subtitle">{internal_option.subtitle}</div>
                </div>
            </div>)}
        </div>
    </div>
}
