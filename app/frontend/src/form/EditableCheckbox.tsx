import { h } from "preact"

import "./Editable.css"



interface OwnProps
{
    disabled?: boolean
    value: boolean | undefined
    on_change?: (new_value: boolean) => void
}


export function EditableCheckbox (props: OwnProps)
{
    props.value

    const { on_change } = props
    const disabled = props.disabled || !on_change

    return <input
        type="checkbox"
        checked={props.value}
        disabled={disabled}
        style={{ cursor: disabled ? "not-allowed" : "" }}
        onChange={e => {
            if (!on_change) return

            const new_value = e.currentTarget.checked
            on_change(new_value)
        }}
    />
}
