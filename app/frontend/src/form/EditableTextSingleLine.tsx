import { h } from "preact"
import { useState } from "preact/hooks"
import type { Store } from "redux"

import "./Editable.css"
import { config_store } from "../state/store"
import type { RootState } from "../state/State"
import { WComponentSearchWindow } from "../search/WComponentSearchWindow"



let store: Store<RootState>


interface OwnProps
{
    disabled?: boolean
    placeholder: string
    value: string
    on_change?: (new_value: string) => void
}


export function EditableTextSingleLine (props: OwnProps)
{
    const [id_insertion_point, set_id_insertion_point] = useState<number | undefined>(undefined)

    const { on_change, disabled } = props
    if (!on_change || disabled)
    {
        const class_name = (disabled ? "disabled" : "")
        return <div className={class_name}>{props.value || props.placeholder}</div>
    }


    const conditional_on_change = (new_value: string) => new_value !== props.value && on_change(new_value)

    return <div class={"editable_field " + (!props.value ? " placeholder " : "")}>
        <input
            type="text"
            placeholder={props.placeholder}
            value={props.value}
            onFocus={e => {
                // Hide the placeholder
                if (!e.currentTarget.value) e.currentTarget.placeholder = ""
            }}
            onChange={e => {
                handle_text_field_change({ e, set_id_insertion_point, conditional_on_change })
            }}
            onBlur={e => {
                // re-display the placeholder
                if (!e.currentTarget.value) e.currentTarget.placeholder = props.placeholder

                conditional_on_change(e.currentTarget.value)
            }}
        />

        <ConditionalWComponentSearchWindow
            value={props.value}
            id_insertion_point={id_insertion_point}
            conditional_on_change={conditional_on_change}
            set_id_insertion_point={set_id_insertion_point}
        />
    </div>
}


interface HandleTextFieldChangeArgs
{
    e: h.JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement, Event>
    conditional_on_change: (value: string) => void
    set_id_insertion_point: (insertion_point: number) => void
}
export function handle_text_field_change (args: HandleTextFieldChangeArgs)
{
    update_parent_placeholder_css_class(args.e)
    get_caret_position(args)
}



function update_parent_placeholder_css_class (e: h.JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement, Event>)
{
    const parent = e.currentTarget.parentElement!
    const command = e.currentTarget.value ? "remove" : "add"
    parent.classList[command]("placeholder")
}


function get_caret_position (args: HandleTextFieldChangeArgs)
{

    // Protect against IE
    const { selectionStart, value } = args.e.currentTarget
    if (typeof selectionStart !== "number") return

    const char1 = value[selectionStart - 2]
    const char2 = value[selectionStart - 1]

    if (char1 !== "@" || char2 !== "@") return

    if (!store) store = config_store()

    if (store.getState().global_keys.last_key !== "@") return

    args.conditional_on_change(value)
    // Open search modal
    args.set_id_insertion_point(selectionStart)
}





interface ConditionalWComponentSearchWindowProps
{
    value: string
    id_insertion_point: number | undefined
    conditional_on_change: (new_value: string) => void
    set_id_insertion_point: (id_insertion_point: number | undefined) => void
}
export function ConditionalWComponentSearchWindow (props: ConditionalWComponentSearchWindowProps)
{
    const [id_to_insert, set_id_to_insert] = useState<string | undefined>(undefined)

    const { id_insertion_point } = props
    if (id_insertion_point === undefined) return null


    const { value, conditional_on_change, set_id_insertion_point } = props

    return <WComponentSearchWindow
        on_change={wcomponent_id => set_id_to_insert(wcomponent_id)}
        on_blur={() =>
        {
            const new_value = insert_id_into_text({
                value: props.value,
                id_to_insert,
                id_insertion_point,
            })
            conditional_on_change(new_value)
            set_id_insertion_point(undefined)
            set_id_to_insert(undefined)
        }}
    />
}



interface InsertIdIntoTextArgs
{
    value: string
    id_to_insert: string | undefined
    id_insertion_point: number
}
function insert_id_into_text (args: InsertIdIntoTextArgs)
{
    const { value, id_to_insert, id_insertion_point } = args

    if (id_to_insert === undefined) return value

    return value.slice(0, id_insertion_point) + id_to_insert + value.slice(id_insertion_point)
}
