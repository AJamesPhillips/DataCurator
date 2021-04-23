import { h } from "preact"

import "./button.css"



interface OwnProps
{
    is_hidden?: boolean
    value: string
    // Some functionality legitimately needs to have pointer_down vs click.
    // For example EditableCustomDateTime will hide the button which has triggered the blur
    // and only pointer_down will work, the onClick will not even fire.
    on_pointer_down: (e: h.JSX.TargetedMouseEvent<HTMLInputElement>) => void
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
        onPointerDown={e => props.on_pointer_down(e)}
        className={class_names}
        disabled={props.disabled}
    />
}
