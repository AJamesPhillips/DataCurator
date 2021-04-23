import { h } from "preact"

import "./button.css"



interface OwnProps
{
    is_hidden?: boolean
    value: string
    on_click: (e: h.JSX.TargetedMouseEvent<HTMLInputElement>) => void
    size?: "small" | "normal" | "large"
    is_left?: boolean
    disabled?: boolean
    extra_class_names?: string
}


export function Button (props: OwnProps)
{
    if (props.is_hidden) return null

    const class__size = props.size === "large" ? "large" : (props.size === "normal" ? "normal_size" : "")
    const class__position = props.is_left ? "left" : ""
    const class__disabled = props.disabled ? "disabled" : ""
    const class_names = `button_text ${props.extra_class_names || ""} ${class__size} ${class__position} ${class__disabled}`

    return <input
        type="button"
        value={props.value}
        onClick={e => props.on_click(e)}
        className={class_names}
        disabled={props.disabled}
    ></input>
}
