import { FunctionalComponent, h } from "preact"
import { Ref, useEffect, useRef, useState } from "preact/hooks"
import type { Store } from "redux"

import "../Editable.css"
import type { RootState } from "../../state/State"
import { config_store } from "../../state/store"
import { connect, ConnectedProps } from "react-redux"
import { RichMarkDown } from "../../sharedf/RichMarkDown"
import { ACTIONS } from "../../state/actions"
import { ConditionalWComponentSearchWindow } from "../ConditionalWComponentSearchWindow"



//  \    /
//   \  /
//    \/
let store: Store<RootState>
//    /\
//   /  \
//  /    \



export interface EditableTextCommonOwnProps
{
    disabled?: boolean
    placeholder: string
    value: string
    on_change?: (new_value: string) => void
    on_blur?: (value: string) => void
    force_focus?: boolean
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


    const { placeholder, on_change, on_blur, disabled, presenting, force_focus, set_editing_text_flag } = props

    if ((!on_change && !on_blur) || disabled || presenting)
    {
        const class_name = (disabled ? "disabled" : "")
        return <div className={class_name}>
            <RichMarkDown text={value || placeholder} />
        </div>
    }


    const conditional_on_change = (new_value: string) =>
    {
        on_change && on_change(new_value)
        set_value(new_value)
    }


    const class_name = `editable_field ${value ? "" : "placeholder"}`


    const on_render = (el: HTMLTextAreaElement | HTMLInputElement) =>
    {
        handle_text_field_render({ id_insertion_point, on_focus_set_selection, el, force_focus })
    }


    const on_focus = (e: h.JSX.TargetedFocusEvent<HTMLTextAreaElement | HTMLInputElement>) =>
    {
        handle_text_field_focus({ e, set_editing_text_flag })
    }


    const wrapped_on_change = (e: h.JSX.TargetedEvent<HTMLTextAreaElement | HTMLInputElement, Event>) =>
    {
        handle_text_field_change({ e, set_id_insertion_point, conditional_on_change })
    }


    const wrapped_on_blur = (e: h.JSX.TargetedFocusEvent<HTMLTextAreaElement | HTMLInputElement>) =>
    {
        handle_text_field_blur({ e, conditional_on_change, on_blur, set_editing_text_flag })
    }


    return <div className={class_name}>
        {props.component({ value, on_render, on_focus, on_change: wrapped_on_change, on_blur: wrapped_on_blur })}

        {id_insertion_point !== undefined && <ConditionalWComponentSearchWindow
            value={value}
            id_insertion_point={id_insertion_point}
            set_id_insertion_point={set_id_insertion_point}
            on_focus_set_selection={on_focus_set_selection}
            conditional_on_change={conditional_on_change}
        />}
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
}
function handle_text_field_focus (args: HandleTextFieldFocusArgs)
{
    args.set_editing_text_flag(true)
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
    conditional_on_change: (value: string) => void
    set_editing_text_flag: (value: boolean) => void
    on_blur?: (value: string) => void
}
function handle_text_field_blur (args: HandleTextFieldBlurArgs)
{
    const { value } = args.e.currentTarget
    args.conditional_on_change(value)
    args.set_editing_text_flag(false)
    args.on_blur && args.on_blur(value)
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
