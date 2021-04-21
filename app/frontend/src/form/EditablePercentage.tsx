import { h } from "preact"

import { bounded } from "../utils/utils"
import "./Editable.css"
import { EditableTextSingleLine } from "./EditableTextSingleLine"



interface OwnProps
{
    disabled?: boolean
    placeholder: string
    value: number | undefined
    on_change?: (new_value: number) => void
}


export function EditablePercentage (props: OwnProps)
{
    const value = percentage_to_string(props.value)

    const { on_change, disabled } = props
    if (!on_change || disabled)
    {
        const class_name = "editable_percentage" + (disabled ? "disabled" : "")
        return <div className={class_name}>{value || props.placeholder}&nbsp;%</div>
    }


    return <div className="editable_percentage">
        <EditableTextSingleLine
            placeholder={props.placeholder}
            value={value}
            on_change={new_value => {
                const valid_value = string_to_percentage(new_value)
                if (valid_value !== undefined) on_change(valid_value)
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


export function percentage_to_string (value: number | undefined): string
{
    if (value === undefined) return ""

    return (bounded(value, 0, 1) * 100).toPrecision(3)
}
