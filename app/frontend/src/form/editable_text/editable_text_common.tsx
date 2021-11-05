import { FunctionalComponent, h } from "preact"
import { Ref, useEffect, useRef, useState } from "preact/hooks"

import "../Editable.css"
import type { RootState } from "../../state/State"
import { get_store } from "../../state/store"
import { connect, ConnectedProps } from "react-redux"
import { RichMarkDown } from "../../sharedf/RichMarkDown"
import { ACTIONS } from "../../state/actions"
import { ConditionalWComponentSearchWindow } from "../ConditionalWComponentSearchWindow"



export interface EditableTextCommonOwnProps
{
    disabled?: boolean
    placeholder: string
    value: string
    conditional_on_change?: (new_value: string) => void
    conditional_on_blur?: (value: string) => void
    always_on_blur?: (value: string) => void
    force_focus?: boolean
    force_editable?: boolean
    select_all_on_focus?: boolean
    size?: "small" | "medium"
    hide_label?: boolean
    style?: h.JSX.CSSProperties
}



export interface EditableTextComponentArgs
{
    value: string
    on_render: (el: HTMLTextAreaElement | HTMLInputElement) => void
    on_focus: (e: h.JSX.TargetedFocusEvent<HTMLTextAreaElement | HTMLInputElement>) => void
    on_change: (e: h.JSX.TargetedEvent<HTMLTextAreaElement | HTMLInputElement, Event>) => void
    on_blur: (e: h.JSX.TargetedFocusEvent<HTMLTextAreaElement | HTMLInputElement>) => void
}


interface OwnProps extends EditableTextCommonOwnProps
{
    component: (args: EditableTextComponentArgs) => h.JSX.Element
}



const map_state = (state: RootState) => ({
    presenting: state.display_options.consumption_formatting,
})


const map_dispatch = {
    set_editing_text_flag: ACTIONS.user_activity.set_editing_text_flag,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _EditableTextCommon (props: Props)
{
    const [value, set_value] = useState<string>(props.value)
    useEffect(() => set_value(props.value), [props.value])


    const [id_insertion_point, set_id_insertion_point] = useState<number | undefined>(undefined)
    const on_focus_set_selection = useRef<[number, number] | undefined>(undefined)


    const {
        placeholder,
        conditional_on_change: user_conditional_on_change,
        conditional_on_blur,
        always_on_blur,
        disabled,
        presenting,
        force_editable,
        select_all_on_focus,
        force_focus,
        set_editing_text_flag,
    } = props

    if (force_editable === false || (!user_conditional_on_change && !conditional_on_blur && !always_on_blur) || disabled || (presenting && force_editable !== true))
    {
        const class_name = (disabled ? "disabled" : "")
        const have_value = props.value !== undefined

        return <div className={class_name}>
            {have_value && !props.hide_label && <span className="description_label">{props.placeholder}&nbsp;</span>}
            <RichMarkDown text={value || placeholder} />
        </div>
    }


    const conditional_on_change = (new_value: string) =>
    {
        if (new_value !== value) user_conditional_on_change && user_conditional_on_change(new_value)
        set_value(new_value)
    }


    const class_name = `editable_field ${value ? "" : "placeholder"}`


    const on_render = (el: HTMLTextAreaElement | HTMLInputElement) =>
    {
        handle_text_field_render({ id_insertion_point, on_focus_set_selection, el, force_focus })
    }


    const on_focus = (e: h.JSX.TargetedFocusEvent<HTMLTextAreaElement | HTMLInputElement>) =>
    {
        handle_text_field_focus({ e, set_editing_text_flag, select_all_on_focus })
    }


    const wrapped_conditional_on_change = (e: h.JSX.TargetedEvent<HTMLTextAreaElement | HTMLInputElement, Event>) =>
    {
        if (id_insertion_point !== undefined) return
        handle_text_field_change({ e, set_id_insertion_point, conditional_on_change })
    }


    const wrapped_on_blur = (e: h.JSX.TargetedFocusEvent<HTMLTextAreaElement | HTMLInputElement>) =>
    {
        if (id_insertion_point !== undefined) return
        handle_text_field_blur({ e, initial_value: props.value, conditional_on_blur, always_on_blur, set_editing_text_flag })
    }


    return <div className={class_name} style={props.style}>
        {props.component({
            value,
            on_render,
            on_focus,
            on_change: wrapped_conditional_on_change,
            on_blur: wrapped_on_blur,
        })}

        {id_insertion_point !== undefined && <div style={{ fontSize: "initial", fontWeight: "initial" }}>
            <ConditionalWComponentSearchWindow
                value={value}
                id_insertion_point={id_insertion_point}
                set_id_insertion_point={set_id_insertion_point}
                on_focus_set_selection={on_focus_set_selection}
                conditional_on_change={conditional_on_change}
            />
        </div>}
    </div>
}

export const EditableTextCommon = connector(_EditableTextCommon) as FunctionalComponent<OwnProps>



interface HandleTextFieldRenderArgs
{
    id_insertion_point: number | undefined
    on_focus_set_selection: Ref<[number, number] | undefined>
    el: HTMLInputElement | HTMLTextAreaElement
    force_focus: boolean | undefined
}
function handle_text_field_render (args: HandleTextFieldRenderArgs)
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



interface HandleTextFieldFocusArgs
{
    e: h.JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement, Event>
    set_editing_text_flag: (value: boolean) => void
    select_all_on_focus?: boolean
}
function handle_text_field_focus (args: HandleTextFieldFocusArgs)
{
    args.set_editing_text_flag(true)
    if (args.select_all_on_focus)
    {
        const el: HTMLInputElement | HTMLTextAreaElement = args.e.currentTarget
        // Something else is interfering with this function.  It correctly runs on every focus event but
        // the 2nd, 4th, 6th, etc focus events result in all the text being selected followed by
        // being immediately deselected.  This only occurs when using `conditional_on_change` and not
        // when using `conditional_on_blur`
        el.setSelectionRange(0, el.value.length)
    }
}



interface HandleTextFieldChangeArgs
{
    e: h.JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement, Event>
    conditional_on_change: (value: string) => void
    set_id_insertion_point: (insertion_point: number) => void
}
function handle_text_field_change (args: HandleTextFieldChangeArgs)
{
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
    initial_value: string
    set_editing_text_flag: (value: boolean) => void
    conditional_on_blur?: (value: string) => void
    always_on_blur?: (value: string) => void
}
function handle_text_field_blur (args: HandleTextFieldBlurArgs)
{
    const { value } = args.e.currentTarget
    const { set_editing_text_flag, initial_value, conditional_on_blur, always_on_blur } = args
    set_editing_text_flag(false)

    if (initial_value !== value) conditional_on_blur && conditional_on_blur(value)
    always_on_blur && always_on_blur(value)
}



function get_id_insertion_point ({ selectionStart, value }: { selectionStart: number | null, value: string })
{
    if (typeof selectionStart === "number")
    {
        const char1 = value[selectionStart - 2]
        const char2 = value[selectionStart - 1]

        if (char1 === "@" && char2 === "@")
        {
            const store = get_store()

            if (store.getState().global_keys.last_key === "@")
            {
                return selectionStart
            }
        }
    }

    return undefined
}
