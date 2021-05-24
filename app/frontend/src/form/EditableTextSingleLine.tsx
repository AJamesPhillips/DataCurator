import { h } from "preact"
import { Ref, useRef, useState } from "preact/hooks"
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
    const on_focus_set_cursor_position = useRef<number | undefined>(undefined)


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
            ref={el =>
            {
                // We have initiated a searchWindow to populate an id insertiong so we do not want to
                // focus this input box now
                if (id_insertion_point !== undefined) return

                const position = on_focus_set_cursor_position.current
                on_focus_set_cursor_position.current = undefined

                if (el && position !== undefined)
                {
                    setTimeout(() => {
                        el.focus()
                        // el.setSelectionRange(0, value.length)
                        el.setSelectionRange(position, position)
                    }, 0)
                }
            }}
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

        {id_insertion_point !== undefined && <ConditionalWComponentSearchWindow
            value={props.value}
            id_insertion_point={id_insertion_point}
            set_id_insertion_point={set_id_insertion_point}
            on_focus_set_cursor_position={on_focus_set_cursor_position}
            conditional_on_change={conditional_on_change}
        />}
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
    optionally_set_id_insertion_point(args)
}



function update_parent_placeholder_css_class (e: h.JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement, Event>)
{
    const parent = e.currentTarget.parentElement!
    const command = e.currentTarget.value ? "remove" : "add"
    parent.classList[command]("placeholder")
}


function optionally_set_id_insertion_point (args: HandleTextFieldChangeArgs)
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
    id_insertion_point: number
    set_id_insertion_point: (id_insertion_point: number | undefined) => void
    on_focus_set_cursor_position: Ref<number | undefined>
    conditional_on_change: (new_value: string) => void
}
export function ConditionalWComponentSearchWindow (props: ConditionalWComponentSearchWindowProps)
{
    const id_to_insert = useRef<string | undefined>(undefined)

    const {
        value, id_insertion_point, on_focus_set_cursor_position,
        conditional_on_change, set_id_insertion_point,
    } = props


    const initial_search_term = get_initial_search_term({ value, id_insertion_point })


    return <WComponentSearchWindow
        initial_search_term={initial_search_term}
        on_change={_id_to_insert => id_to_insert.current = _id_to_insert}
        on_blur={() =>
        {
            const new_value = insert_id_into_text({
                value,
                id_to_insert: id_to_insert.current,
                id_insertion_point,
            })

            const cursor_position_at_end_of_inserted_id = id_insertion_point + (id_to_insert.current !== undefined ? id_to_insert.current.length : 0)

            on_focus_set_cursor_position.current = cursor_position_at_end_of_inserted_id
            set_id_insertion_point(undefined)
            conditional_on_change(new_value)
        }}
    />
}



interface GetInitialSearchTermArgs
{
    value: string
    id_insertion_point: number
}
function get_initial_search_term (args: GetInitialSearchTermArgs)
{
    const text_after_insertion_point = args.value.slice(args.id_insertion_point)

    const search_term_match = text_after_insertion_point.match(/\s*(\w+)/)

    return search_term_match ? search_term_match[1] : ""
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
