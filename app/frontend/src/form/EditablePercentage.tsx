import { h } from "preact"

import "./Editable.css"
import { bounded } from "../shared/utils/bounded"
import { EditableTextSingleLine } from "./editable_text/EditableTextSingleLine"
import { percentage_to_string } from "../sharedf/percentages"



interface OwnProps
{
    disabled?: boolean
    placeholder: string
    value: number | undefined
    conditional_on_change?: (new_value: number) => void
    conditional_on_blur?: (new_value: number) => void
}


export function EditablePercentage (props: OwnProps)
{
    const value = percentage_to_string(props.value)

    const { conditional_on_change, conditional_on_blur, disabled } = props
    if ((!conditional_on_change && !conditional_on_blur) || disabled)
    {
        const class_name = "editable_percentage" + (disabled ? "disabled" : "")
        const have_value = props.value !== undefined

        return <div className={class_name}>
            {have_value && <span className="description_label">{props.placeholder}</span>}
            {value || props.placeholder}&nbsp;%
        </div>
    }


    return <div className="editable_percentage">
        <EditableTextSingleLine
            placeholder={props.placeholder}
            value={value}
            conditional_on_change={new_value => {
                const valid_value = string_to_percentage(new_value)
                if (valid_value !== undefined) conditional_on_change && conditional_on_change(valid_value)
            }}
            conditional_on_blur={new_value => {
                const valid_value = string_to_percentage(new_value)
                if (valid_value !== undefined) conditional_on_blur && conditional_on_blur(valid_value)
            }}
        />&nbsp;%
    </div>
}



function string_to_percentage (value: string): number | undefined
{
    if (!value) return undefined

    const num_value = parseFloat(value)
    if (Number.isNaN(num_value)) return 0

    return bounded(num_value, 0, 100) / 100
}
