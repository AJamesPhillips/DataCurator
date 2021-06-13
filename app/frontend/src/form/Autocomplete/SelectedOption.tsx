import { h } from "preact"

import "./SelectedOption.css"
import { Button } from "../../sharedf/Button"
import type { AutocompleteOption } from "./AutocompleteText"



interface Props <E extends AutocompleteOption = AutocompleteOption>
{
    editing: boolean
    option: E | undefined
    on_remove_option: (removed_id: string) => void
    on_mouse_over_option?: (id: E["id"] | undefined) => void
    on_mouse_leave_option?: (id: E["id"] | undefined) => void
    on_pointer_down_selected_option?: (e: h.JSX.TargetedPointerEvent<HTMLDivElement>, id: E["id"]) => void
}


export function SelectedOption <E extends AutocompleteOption> (props: Props<E>)
{
    const { editing, option, on_remove_option, on_mouse_over_option, on_mouse_leave_option,
        on_pointer_down_selected_option: pointer_down } = props

    if (!option) return null

    const class_name = `selected_option ${pointer_down ? "" : "not_"}clickable `

    return <div
        className={class_name}
        onPointerOver={() => on_mouse_over_option && on_mouse_over_option(option.id)}
        onPointerLeave={() => on_mouse_leave_option && on_mouse_leave_option(option.id)}
        onPointerDown={e => pointer_down && pointer_down(e, option.id)}
    >
        {editing && <Button
            value="X"
            on_pointer_down={e =>
            {
                e.stopImmediatePropagation()
                on_remove_option(option.id)
            }}
        />}

        {option.title}
    </div>
}
