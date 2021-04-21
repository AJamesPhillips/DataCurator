import { h } from "preact"

import "./Editable.css"
import { EditableTextSingleLine } from "./EditableTextSingleLine"



type OwnProps =
{
    disabled?: boolean
    placeholder: string
    value: number
    allow_undefined: false
    on_change?: (new_value: number) => void
} |
{
    disabled?: boolean
    placeholder: string
    value: number | undefined
    allow_undefined: true
    on_change?: (new_value: number | undefined) => void
}


export function EditableNumber (props: OwnProps)
{
    const value = props.value !== undefined ? props.value.toString() : ""

    const { allow_undefined, on_change, disabled } = props
    if (!on_change || disabled)
    {
        const class_name = (disabled ? "disabled" : "")
        return <div className={class_name}>{props.value || props.placeholder}</div>
    }


    return <div style={{ width: 50, display: "inline-flex" }}>
        <EditableTextSingleLine
            placeholder={props.placeholder}
            value={value}
            on_change={new_value => {
                const valid_value = string_to_number(new_value)
                if (on_change_accepts_undefined(on_change, allow_undefined)) on_change(valid_value)
                else if (valid_value !== undefined) on_change(valid_value)
            }}
        />
    </div>
}



function string_to_number (value: string): number | undefined
{
    if (!value) return undefined

    const num_value = parseFloat(value)
    if (Number.isNaN(num_value)) return 0

    return num_value
}



function on_change_accepts_undefined (on_change: (v: number) => void, allow_undefined?: boolean): on_change is (v: number | undefined) => void
{
    return !!allow_undefined
}
