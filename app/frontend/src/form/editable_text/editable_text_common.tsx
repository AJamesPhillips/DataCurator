import { FunctionalComponent, h } from "preact"
import { Ref, useEffect, useMemo, useRef, useState } from "preact/hooks"

import "../Editable.css"
import type { RootState } from "../../state/State"
import { get_store } from "../../state/store"
import { connect, ConnectedProps } from "react-redux"
import { RichMarkDown } from "../../sharedf/RichMarkDown"
import { ACTIONS } from "../../state/actions"
import { ConditionalWComponentSearchWindow } from "./ConditionalWComponentSearchWindow"
import type { CreationContext } from "../../creation_context/interfaces"
import { pub_sub } from "../../state/pub_sub/pub_sub"
import type { ActionKeyEventArgs } from "../../state/global_keys/actions"



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
    use_creation_context: state.creation_context.use_creation_context,
    creation_context: state.creation_context.creation_context,
})


const map_dispatch = {
    set_editing_text_flag: ACTIONS.user_activity.set_editing_text_flag,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _EditableTextCommon (props: Props)
{
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


    const [value, set_value] = useState<string>(props.value)
    useEffect(() => set_value(props.value), [props.value])


    const el_ref = useRef<HTMLTextAreaElement | HTMLInputElement | undefined>(undefined)
    const id_insertion_point = useRef<number | undefined>(undefined)
    const on_focus_set_selection = useRef<[number, number] | undefined>(undefined)

    const [is_editing_this_specific_text, set_is_editing_this_specific_text] = useState(false)
    const set_is_editing = useMemo(() => (is_editing: boolean) =>
    {
        set_editing_text_flag(is_editing)
        set_is_editing_this_specific_text(is_editing)
    }, [set_editing_text_flag, set_is_editing_this_specific_text])


    if (force_editable === false || (!user_conditional_on_change && !conditional_on_blur && !always_on_blur) || disabled || (presenting && force_editable !== true))
    {
        const class_name = (disabled ? "disabled" : "")
        const have_value = props.value !== undefined

        return <div className={class_name}>
            {have_value && !props.hide_label && <span className="description_label">{props.placeholder}&nbsp;</span>}
            <RichMarkDown text={value || placeholder} />
        </div>
    }


    const conditional_on_change = useMemo(() => (new_value: string) =>
    {
        if (props.use_creation_context)
        {
            new_value = custom_creation_context_replace_text(props.creation_context, new_value)
        }

        if (new_value !== value) user_conditional_on_change && user_conditional_on_change(new_value)
        set_value(new_value)
    }, [])


    useEffect(() =>
    {
        return pub_sub.global_keys.sub("key_down", handle_general_key_down(is_editing_this_specific_text, el_ref.current, conditional_on_change))
    })


    const class_name = `editable_field ${value ? "" : "placeholder"}`


    const on_render = useMemo(() => (el: HTMLTextAreaElement | HTMLInputElement) =>
    {
        if (el_ref.current === el) return // quick hack to prevent multiple erroneous calls to following render code
        el_ref.current = el
        handle_text_field_render({ id_insertion_point, on_focus_set_selection, el, force_focus })
    }, [on_focus_set_selection, force_focus])


    const on_focus = useMemo(() => (e: h.JSX.TargetedFocusEvent<HTMLTextAreaElement | HTMLInputElement>) =>
    {
        handle_text_field_focus({ e, set_is_editing, select_all_on_focus })
    }, [set_is_editing, select_all_on_focus])


    const wrapped_conditional_on_change = useMemo(() => (e: h.JSX.TargetedEvent<HTMLTextAreaElement | HTMLInputElement, Event>) =>
    {
        if (id_insertion_point.current !== undefined) return
        handle_text_field_change({ e, id_insertion_point, conditional_on_change })
    }, [conditional_on_change])


    const wrapped_on_blur = useMemo(() => (e: h.JSX.TargetedFocusEvent<HTMLTextAreaElement | HTMLInputElement>) =>
    {
        if (id_insertion_point.current !== undefined) return
        handle_text_field_blur({ e, initial_value: props.value, conditional_on_blur, always_on_blur, set_is_editing })
    }, [props.value, conditional_on_blur, always_on_blur, set_is_editing])


    const input_component = useMemo(() =>
    {
        return props.component({
            value,
            on_render,
            on_focus,
            on_change: wrapped_conditional_on_change,
            on_blur: wrapped_on_blur,
        })
    }, [value, on_render, on_focus, wrapped_conditional_on_change, wrapped_on_blur])


    return <div className={class_name} style={props.style}>
        {input_component}

        {id_insertion_point.current !== undefined && <div style={{ fontSize: "initial", fontWeight: "initial" }}>
            <ConditionalWComponentSearchWindow
                value={value}
                id_insertion_point={id_insertion_point.current}
                on_focus_set_selection={on_focus_set_selection}
                conditional_on_change={new_value =>
                {
                    id_insertion_point.current = undefined
                    conditional_on_change(new_value)
                }}
            />
        </div>}
    </div>
}

export const EditableTextCommon = connector(_EditableTextCommon) as FunctionalComponent<OwnProps>



interface HandleTextFieldRenderArgs
{
    id_insertion_point: Ref<number | undefined>
    on_focus_set_selection: Ref<[number, number] | undefined>
    el: HTMLInputElement | HTMLTextAreaElement
    force_focus: boolean | undefined
}
function handle_text_field_render (args: HandleTextFieldRenderArgs)
{
    // We have initiated a searchWindow to populate an id insertion so we do not want to
    // focus this input box now
    if (args.id_insertion_point.current !== undefined) return

    const position = args.on_focus_set_selection.current
    args.on_focus_set_selection.current = undefined

    const should_gain_focus = position || args.force_focus
    if (should_gain_focus)
    {
        setTimeout(() => {
            console.log("gaining focus for ", args.el, position, args.force_focus)
            args.el.focus()
            if (position) args.el.setSelectionRange(position[0], position[1])
        }, 0)
    }
}



interface HandleTextFieldFocusArgs
{
    e: h.JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement, Event>
    set_is_editing: (value: boolean) => void
    select_all_on_focus?: boolean
}
function handle_text_field_focus (args: HandleTextFieldFocusArgs)
{
    args.set_is_editing(true)
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
    id_insertion_point: Ref<number | undefined>
}
function handle_text_field_change (args: HandleTextFieldChangeArgs)
{
    const new_id_insertion_point = get_id_insertion_point(args.e.currentTarget)
    if (new_id_insertion_point !== undefined) args.id_insertion_point.current = new_id_insertion_point

    // note: if id_insertion_point is changed to not be undefined, e.g. the user has typed "@@", then
    // that change plus this change of value (because the user entered @@) will cause search modal to open.
    args.conditional_on_change(args.e.currentTarget.value)
}



interface HandleTextFieldBlurArgs
{
    e: h.JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement, Event>
    initial_value: string
    set_is_editing: (value: boolean) => void
    conditional_on_blur?: (value: string) => void
    always_on_blur?: (value: string) => void
}
function handle_text_field_blur (args: HandleTextFieldBlurArgs)
{
    const { value } = args.e.currentTarget
    const { set_is_editing, initial_value, conditional_on_blur, always_on_blur } = args
    set_is_editing(false)

    if (initial_value !== value) conditional_on_blur && conditional_on_blur(value)
    always_on_blur && always_on_blur(value)
}



enum ReplacingTextType
{
    url, title, nothing
}
function handle_general_key_down (is_editing_this_specific_text: boolean, el: HTMLInputElement | HTMLTextAreaElement | undefined, conditional_on_change: (value: string) => void)
{
    return (k: ActionKeyEventArgs) =>
    {
        if (!is_editing_this_specific_text) return
        if (!el) return // type guard

        if (!k.ctrl_key || k.key !== "k") return
        const { value, selectionStart } = el
        let { selectionEnd } = el

        if (typeof selectionStart !== "number") return
        if (typeof selectionEnd !== "number") selectionEnd = selectionStart

        const selected_text = value.slice(selectionStart, selectionEnd)
        const replacing_text = selected_text ? (selected_text.startsWith("http") ? ReplacingTextType.url : ReplacingTextType.title) : ReplacingTextType.nothing

        const title_text = replacing_text === ReplacingTextType.title ? selected_text : "title"
        const url_text = replacing_text === ReplacingTextType.url ? selected_text : "url"

        const new_value = (value.slice(0, selectionStart)
            + "[" + title_text + "](" + url_text + ")"
            + value.slice(selectionEnd)
        )

        conditional_on_change(new_value)

        let start = selectionStart + 1 // 1 is the "["
        let end = start + title_text.length
        if (replacing_text === ReplacingTextType.title)
        {
            start = selectionEnd + 3 // 1 each from "[" "]" and "("
            end = start + url_text.length
        }

        setTimeout(() => el.setSelectionRange(start, end), 0)
    }
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



function custom_creation_context_replace_text (creation_context: CreationContext | undefined, new_value: string): string
{
    if (creation_context?.replace_text_target && creation_context?.replace_text_replacement)
    {
        new_value = new_value.replaceAll(creation_context.replace_text_target, creation_context.replace_text_replacement)
    }

    return new_value
}
