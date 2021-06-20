import type { h } from "preact"
import type { Ref } from "preact/hooks"
import type { Store } from "redux"

import type { RootState } from "../../state/State"
import { config_store } from "../../state/store"



let store: Store<RootState>



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



interface HandleTextFieldFocusArgs
{
    e: h.JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement, Event>
    set_editing_text_flag: (value: boolean) => void
}
export function handle_text_field_focus (args: HandleTextFieldFocusArgs)
{
    args.set_editing_text_flag(true)
}



interface HandleTextFieldChangeArgs
{
    e: h.JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement, Event>
    conditional_on_change: (value: string) => void
    set_id_insertion_point: (insertion_point: number) => void
}
export function handle_text_field_change (args: HandleTextFieldChangeArgs)
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
export function handle_text_field_blur (args: HandleTextFieldBlurArgs)
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
