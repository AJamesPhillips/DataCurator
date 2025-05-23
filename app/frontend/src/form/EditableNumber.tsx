import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import "./Editable.css"
import "./EditableNumber.css"
import { EditableTextSingleLine } from "./editable_text/EditableTextSingleLine"
import { EditableTextOnBlurType } from "./editable_text/editable_text_common"



type OwnProps =
{
    disabled?: boolean
    placeholder: string
    default_value_when_invalid?: number
    size?: "small" | "medium"
    style?: h.JSX.CSSProperties
    on_blur_type?: EditableTextOnBlurType
    editing_allowed?: boolean
} & (
{
    value: number
    allow_undefined: false
    conditional_on_change?: (new_value: number) => void
    on_blur?: (value: number) => void
} |
{
    value: number | undefined
    allow_undefined: true
    conditional_on_change?: (new_value: number | undefined) => void
    on_blur?: (value: number | undefined) => void
})



const map_state = (state: RootState) => ({
    editing: !state.display_options.consumption_formatting,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _EditableNumber (props: Props)
{
    const value = props.value !== undefined ? props.value.toString() : ""

    const {
        allow_undefined,
        conditional_on_change,
        on_blur,
        on_blur_type,
        disabled,
        editing,
        default_value_when_invalid = 0,
        editing_allowed,
    } = props


    let class_name = "editable_number"

    if (!editing || (!conditional_on_change && !on_blur) || disabled)
    {
        class_name = class_name + (editing ? "" : " not_editable ") + (disabled ? " disabled " : "")
        const have_value = props.value !== undefined

        return <div className={class_name} style={props.style}>
            {have_value && <span className="description_label">{props.placeholder}</span>}&nbsp;
            {have_value ? props.value : props.placeholder}
        </div>
    }


    return <div className={class_name} style={props.style}>
        <EditableTextSingleLine
            placeholder={props.placeholder}
            size={props.size || "small"}
            style={props.style}
            value={value}
            editing_allowed={editing_allowed}
            select_all_on_focus={true}
            conditional_on_change={new_value =>
            {
                if (!conditional_on_change) return

                const valid_value = string_to_number(new_value, default_value_when_invalid)
                if (on_event_handler_accepts_undefined(conditional_on_change, allow_undefined)) conditional_on_change(valid_value)
                else if (valid_value !== undefined) conditional_on_change(valid_value)
            }}
            on_blur={value =>
            {
                if (!on_blur) return

                handle_blur({ value, default_value_when_invalid, on_blur, allow_undefined })
            }}
            on_blur_type={on_blur_type || EditableTextOnBlurType.conditional}
        />
    </div>
}

export const EditableNumber = connector(_EditableNumber) as FunctionalComponent<OwnProps>



function string_to_number (value: string, default_value_when_invalid: number): number | undefined
{
    if (!value) return undefined

    const num_value = parseFloat(value)
    if (Number.isNaN(num_value)) return default_value_when_invalid

    return num_value
}



function on_event_handler_accepts_undefined (on_change: (v: number) => void, allow_undefined?: boolean): on_change is (v: number | undefined) => void
{
    return !!allow_undefined
}



interface HandleBlurArgs
{
    value: string
    default_value_when_invalid: number
    on_blur: ((value: number) => void) | ((value: number | undefined) => void)
    allow_undefined: boolean
}
function handle_blur ({ value, default_value_when_invalid, on_blur, allow_undefined }: HandleBlurArgs)
{
    let valid_value = string_to_number(value, default_value_when_invalid)

    if (on_event_handler_accepts_undefined(on_blur, allow_undefined))
    {
        on_blur(valid_value)
    }
    else
    {
        if (valid_value === undefined) valid_value = default_value_when_invalid
        on_blur(valid_value)
    }
}
