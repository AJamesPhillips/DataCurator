import { FunctionalComponent, h } from "preact"
import { useEffect, useMemo, useRef, useState } from "preact/hooks"

import { connect, ConnectedProps } from "react-redux"
import { RichMarkDown } from "../../sharedf/rich_text/RichMarkDown"
import type { RootState } from "../../state/State"
import { get_store } from "../../state/store"
import "../Editable.css"
import { ConditionalWComponentSearchWindow, OnFocusSetSelection } from "./ConditionalWComponentSearchWindow"



export type EditableTextCommonOwnProps =
{
    disabled?: boolean
    disabled_input?: boolean // related to `disabled` but only disables the input field, keeps styling
    placeholder: string
    value: string
    conditional_on_change?: (new_value: string) => void
    force_focus_on_first_render?: boolean
    editing_allowed?: boolean
    select_all_on_focus?: boolean
    size?: "small" | "medium"
    hide_label?: boolean
    style?: h.JSX.CSSProperties
    spellcheck?: boolean
    title?: string
} & ({
    modify_value_pre_on_blur?: undefined
    on_blur?: undefined
    on_blur_type?: undefined
} | {
    modify_value_pre_on_blur?: (value: string) => string
    on_blur: (value: string) => void
    on_blur_type: EditableTextOnBlurType
})

export enum EditableTextOnBlurType {
    conditional,
    always,
}



export interface EditableTextComponentArgs
{
    value: string
    on_render: (el: HTMLTextAreaElement | HTMLInputElement | null) => void
    on_focus: (e: h.JSX.TargetedFocusEvent<HTMLTextAreaElement | HTMLInputElement>) => void
    on_change: (e: h.JSX.TargetedEvent<HTMLTextAreaElement | HTMLInputElement, Event>) => void
    on_blur: (e: h.JSX.TargetedFocusEvent<HTMLTextAreaElement | HTMLInputElement>) => void
    on_key_down: (e: h.JSX.TargetedKeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void
}


type OwnProps = EditableTextCommonOwnProps &
{
    component: (args: EditableTextComponentArgs) => h.JSX.Element
}



const map_state = (state: RootState) => ({
    presenting: state.display_options.consumption_formatting,
})



const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _EditableTextCommon (props: Props)
{
    const {
        placeholder,
        disabled,
        presenting,
        editing_allowed,
        select_all_on_focus,
        force_focus_on_first_render,
        on_blur_type = EditableTextOnBlurType.conditional,
    } = props


    const [value, set_value] = useState<string>(props.value)
    useEffect(() => set_value(props.value), [props.value])


    const el_ref = useRef<HTMLTextAreaElement | HTMLInputElement | undefined>(undefined)
    const id_insertion_point = useRef<number | undefined>(undefined)


    if (editing_allowed === false || (!props.conditional_on_change && !props.on_blur) || disabled || (presenting && editing_allowed === undefined))
    {
        const class_name = (disabled ? "disabled" : "")
        const have_value = !!props.value

        return <div className={class_name}>
            {have_value && !props.hide_label && <span className="description_label">{props.placeholder}&nbsp;</span>}
            <RichMarkDown text={value || placeholder} />
        </div>
    }


    const class_name = `editable_field ${value ? "" : "placeholder"}`


    const on_render = useMemo(() => (el: HTMLTextAreaElement | HTMLInputElement | null) =>
    {
        if (!el) return

        // This is a hack to prevent multiple calls to `handle_text_field_render`.  You can not
        // use a conditional of `el_ref.current !== el` because the virtual DOM element object
        // changes even if the final DOM element does not change.
        //
        // If you do not do this then every time you shift from presenting mode to editing mode,
        // the `.focus()` fires inside the `handle_text_field_render` and blurs the "previous"
        // input element which causes the `handle_on_blur` to fire.
        const rendering_first_time = !el_ref.current

        el_ref.current = el
        if (rendering_first_time) handle_text_field_render({ el, force_focus_on_first_render })
    }, [])


    const on_focus = useMemo(() => (e: h.JSX.TargetedFocusEvent<HTMLTextAreaElement | HTMLInputElement>) =>
    {
        handle_text_field_focus({ e, select_all_on_focus })
    }, [select_all_on_focus])



    const wrapped_conditional_on_change = useMemo(() => (new_value: string) =>
    {
        if (new_value !== props.value && props.conditional_on_change) props.conditional_on_change(new_value)
        set_value(new_value)
    }, [props.value, props.conditional_on_change])


    const wrapped_on_blur = useMemo(() => (new_value: string) =>
    {
        if (props.modify_value_pre_on_blur)
        {
            new_value = props.modify_value_pre_on_blur(new_value)
        }

        const value_has_changed = new_value !== props.value
        if (on_blur_type === EditableTextOnBlurType.always || value_has_changed)
        {
            if (props.on_blur) props.on_blur(new_value)
        }

        set_value(new_value)
    }, [props.value, on_blur_type, props.on_blur])



    const handle_on_change = useMemo(() => (e: h.JSX.TargetedEvent<HTMLTextAreaElement | HTMLInputElement, Event>) =>
    {
        if (id_insertion_point.current !== undefined) return

        const new_id_insertion_point = get_id_insertion_point(e.currentTarget)
        if (new_id_insertion_point !== undefined) id_insertion_point.current = new_id_insertion_point

        // note: if id_insertion_point is changed to not be undefined, e.g. the user has typed "@@", then
        // that change plus this change of value (because the user entered @@) will cause search modal to open.
        wrapped_conditional_on_change(e.currentTarget.value)
    }, [wrapped_conditional_on_change])


    // TargetedFocusEvent
    const handle_on_blur = useMemo(() => (e: h.JSX.TargetedEvent<HTMLTextAreaElement | HTMLInputElement>) =>
    {
        // Do not call on_blur if there is an id_insertion_point because this means the user just triggered
        // the search window by typing `@@` into this input element, which triggered this input to blur
        // but we do not want to save these results yet until the user has returned from selecting the
        // component from the search box.
        if (id_insertion_point.current !== undefined) return

        wrapped_on_blur(e.currentTarget.value)
    }, [props.value, wrapped_on_blur])



    const on_key_down = useMemo(() => (e: h.JSX.TargetedKeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) =>
    {
        handle_general_key_down(e, el_ref.current, wrapped_conditional_on_change, wrapped_on_blur)
    }, [wrapped_conditional_on_change, wrapped_on_blur])


    // When component unmounts, check if it is still being edited.  If so then the `handle_on_blur` above has
    // not yet fired and we need to call on_blur
    const ref_wrapped_on_blur = useRef(wrapped_on_blur)
    ref_wrapped_on_blur.current = wrapped_on_blur
    useEffect(() =>
    {
        return () =>
        {
            if (!el_ref.current) return

            const is_editing_this_specific_text = document.activeElement === el_ref.current
            if (!is_editing_this_specific_text) return

            ref_wrapped_on_blur.current(el_ref.current.value)
        }
    }, [])


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, force_refreshing_render] = useState({}) // todo refactor this component to remove this quick hack
    const refocus_after_search_window = useMemo(() => (on_focus_set_selection: OnFocusSetSelection) =>
    {
        el_ref.current?.focus()
        id_insertion_point.current = undefined
        // This force refresh causes the new value in id_insertion_point.current to be taken into account
        // We do not want to use a setState for id_insertion_point otherwise it continually re-renders
        // this element everytime the user types anything
        force_refreshing_render({})
        el_ref.current?.setSelectionRange(on_focus_set_selection.start, on_focus_set_selection.end)
    }, [])


    const input_component = useMemo(() =>
    {
        return props.component({
            value,
            on_render,
            on_focus,
            on_change: handle_on_change,
            on_blur: handle_on_blur,
            on_key_down,
        })
    }, [value, on_render, on_focus, handle_on_change, handle_on_blur])


    return <div className={class_name} style={props.style}>
        {input_component}

        {id_insertion_point.current !== undefined && <div style={{ fontSize: "initial", fontWeight: "initial" }}>
            <ConditionalWComponentSearchWindow
                value={value}
                id_insertion_point={id_insertion_point.current}
                conditional_on_change={({ new_value, on_focus_set_selection }) =>
                {
                    wrapped_conditional_on_change(new_value)
                    // wait for change from new_value, before selecting text
                    setTimeout(() => refocus_after_search_window(on_focus_set_selection), 0)
                }}
                // On close is called when no value is selected from the list of possible components
                on_close={on_focus_set_selection =>
                {
                    refocus_after_search_window(on_focus_set_selection)
                }}
            />
        </div>}
    </div>
}

export const EditableTextCommon = connector(_EditableTextCommon) as FunctionalComponent<OwnProps>



interface HandleTextFieldRenderArgs
{
    el: HTMLInputElement | HTMLTextAreaElement
    force_focus_on_first_render: boolean | undefined
}
function handle_text_field_render (args: HandleTextFieldRenderArgs)
{
    if (args.force_focus_on_first_render)
    {
        setTimeout(() => args.el.focus(), 0)
    }
}



interface HandleTextFieldFocusArgs
{
    e: h.JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement, Event>
    select_all_on_focus?: boolean
}
function handle_text_field_focus (args: HandleTextFieldFocusArgs)
{
    if (args.select_all_on_focus)
    {
        const el: HTMLInputElement | HTMLTextAreaElement = args.e.currentTarget
        // Something else is interfering with this function.  It correctly runs on every focus event but
        // the 2nd, 4th, 6th, etc focus events result in all the text being selected followed by
        // being immediately deselected.  This only occurs when using `conditional_on_change` and not
        // when using `on_blur`
        el.setSelectionRange(0, el.value.length)
    }
}



function handle_general_key_down (e: h.JSX.TargetedKeyboardEvent<HTMLTextAreaElement | HTMLInputElement>, el: HTMLInputElement | HTMLTextAreaElement | undefined, wrapped_conditional_on_change: (new_value: string) => void, wrapped_on_blur: (new_value: string) => void)
{
    const is_editing_this_specific_text = document.activeElement === el
    if (!is_editing_this_specific_text) return

    handle_ctrl_k_link_insert(e, el, wrapped_conditional_on_change)

    handle_stop_propagation(e, el, wrapped_on_blur)
}



enum ReplacingTextType
{
    url, title, nothing
}
function handle_ctrl_k_link_insert (e: h.JSX.TargetedKeyboardEvent<HTMLTextAreaElement | HTMLInputElement>, el: HTMLInputElement | HTMLTextAreaElement, conditional_on_change: (value: string) => void)
{
    if (!e.ctrlKey) return
    if (e.key !== "k") return

    // There seem to be a range of behaviours in Brave on Mac that occur for
    // ctrl + <some key>.  Specifically calling `preventDefault` for ctrl + k to allow
    // link insertion in text fields when they are being edited.
    e.preventDefault()


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


function handle_stop_propagation (e: h.JSX.TargetedKeyboardEvent<HTMLTextAreaElement | HTMLInputElement>, el: HTMLInputElement | HTMLTextAreaElement, wrapped_on_blur: (new_value: string) => void)
{
    if (e.ctrlKey && e.key === "e")
    {
        wrapped_on_blur(el.value)
        // Allow ctrl + e to propagate
        return
    }

    // The following two are used when you are in editing mode and have selected one node,
    // and this selection will focus that node's title editing field on the node's form, however
    // you want to still be able to use shift and control to select or unselect multiple components
    if (e.key === "Shift") return
    if (e.key === "Control") return

    // console .log("silencing keydown event as not one of allow key presses to propagate")
    e.stopImmediatePropagation()
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
