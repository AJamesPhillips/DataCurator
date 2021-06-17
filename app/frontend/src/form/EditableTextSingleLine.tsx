import { FunctionalComponent, h } from "preact"
import { Ref, useRef, useState } from "preact/hooks"
import type { Store } from "redux"

import "./Editable.css"
import { config_store } from "../state/store"
import type { RootState } from "../state/State"
import { WComponentSearchWindow } from "../search/WComponentSearchWindow"
import { connect, ConnectedProps } from "react-redux"



let store: Store<RootState>


interface OwnProps
{
    disabled?: boolean
    placeholder: string
    value: string
    on_change?: (new_value: string) => void
    on_blur?: (value: string) => void
    force_focus?: boolean
}



const map_state = (state: RootState) => ({
    presenting: state.display_options.consumption_formatting,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _EditableTextSingleLine (props: Props)
{
    const [value, set_value] = useState<string>(props.value)
    const [id_insertion_point, set_id_insertion_point] = useState<number | undefined>(undefined)
    const on_focus_set_selection = useRef<[number, number] | undefined>(undefined)


    const { placeholder, on_change, on_blur, disabled, presenting, force_focus } = props
    if ((!on_change && !on_blur) || disabled || presenting)
    {
        const class_name = (disabled ? "disabled" : "")
        return <div className={class_name}>{props.value || placeholder}</div>
    }


    const conditional_on_change = (new_value: string) =>
    {
        on_change && on_change(new_value)
        set_value(new_value)
    }


    const class_name = `editable_field ${value ? "" : "placeholder"}`


    return <div className={class_name}>
        <input
            type="text"
            placeholder={placeholder}
            value={props.value}
            ref={el =>
            {
                if (!el) return
                handle_text_field_render({ id_insertion_point, on_focus_set_selection, el, force_focus })
            }}
            onChange={e => {
                handle_text_field_change({ e, set_id_insertion_point, conditional_on_change })
            }}
            onBlur={e => {
                handle_text_field_blur({ e, conditional_on_change, on_blur })
            }}
        />

        {id_insertion_point !== undefined && <ConditionalWComponentSearchWindow
            value={props.value}
            id_insertion_point={id_insertion_point}
            set_id_insertion_point={set_id_insertion_point}
            on_focus_set_selection={on_focus_set_selection}
            conditional_on_change={conditional_on_change}
        />}
    </div>
}

export const EditableTextSingleLine = connector(_EditableTextSingleLine) as FunctionalComponent<OwnProps>



interface HandleTextFieldRenderArgs
{
    id_insertion_point: number | undefined
    on_focus_set_selection: Ref<[number, number] | undefined>
    el: HTMLInputElement | HTMLTextAreaElement
    force_focus: boolean | undefined
}
export function handle_text_field_render (args: HandleTextFieldRenderArgs)
{
    // We have initiated a searchWindow to populate an id insertiong so we do not want to
    // focus this input box now
    if (args.id_insertion_point !== undefined) return

    const position = args.on_focus_set_selection.current
    args.on_focus_set_selection.current = undefined

    const should_gain_focus = position || args.force_focus
    if (should_gain_focus)
    {
        setTimeout(() => {
            args.el.focus()
            if (position) args.el.setSelectionRange(position[0], position[1])
        }, 0)
    }
}



interface HandleTextFieldChangeArgs
{
    e: h.JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement, Event>
    conditional_on_change: (value: string) => void
    set_id_insertion_point: (insertion_point: number) => void
}
export function handle_text_field_change (args: HandleTextFieldChangeArgs)
{
    update_parent_placeholder_css_class(args.e.currentTarget)
    const id_insertion_point = get_id_insertion_point(args.e.currentTarget)

    args.conditional_on_change(args.e.currentTarget.value)

    if (id_insertion_point !== undefined)
    {
        // note: will cause search modal to open
        args.set_id_insertion_point(id_insertion_point)
    }
}



interface HandleTextFieldBlurArgs
{
    e: h.JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement, Event>
    conditional_on_change: (value: string) => void
    on_blur?: (value: string) => void
}
export function handle_text_field_blur (args: HandleTextFieldBlurArgs)
{
    const { value } = args.e.currentTarget
    args.conditional_on_change(value)
    args.on_blur && args.on_blur(value)
}



export function update_parent_placeholder_css_class (el: HTMLInputElement | HTMLTextAreaElement)
{
    const parent = el.parentElement!
    const command = el.value ? "remove" : "add"
    parent.classList[command]("placeholder")
}



function get_id_insertion_point ({ selectionStart, value }: { selectionStart: number | null, value: string })
{
    if (typeof selectionStart === "number")
    {
        const char1 = value[selectionStart - 2]
        const char2 = value[selectionStart - 1]

        if (char1 === "@" && char2 === "@")
        {
            if (!store) store = config_store()

            if (store.getState().global_keys.last_key === "@")
            {
                return selectionStart
            }
        }
    }
}





interface ConditionalWComponentSearchWindowProps
{
    value: string
    id_insertion_point: number
    set_id_insertion_point: (id_insertion_point: number | undefined) => void
    on_focus_set_selection: Ref<[number, number] | undefined>
    conditional_on_change: (new_value: string) => void
}
export function ConditionalWComponentSearchWindow (props: ConditionalWComponentSearchWindowProps)
{
    const id_to_insert = useRef<string | undefined>(undefined)

    const {
        value, id_insertion_point, on_focus_set_selection,
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

            const end_of_inserted_id = id_insertion_point + (id_to_insert.current !== undefined ? id_to_insert.current.length : 0)
            const end_of_search_term = end_of_inserted_id + (initial_search_term !== undefined ? initial_search_term.length : 0)

            on_focus_set_selection.current = [end_of_inserted_id, end_of_search_term]
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

    const search_term_match = text_after_insertion_point.match(/^(\w+)/)

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
