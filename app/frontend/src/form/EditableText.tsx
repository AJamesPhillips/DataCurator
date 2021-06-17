import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./Editable.css"
import type { RootState } from "../state/State"
import { adjust_height } from "./utils"
import { RichMarkDown } from "../sharedf/RichMarkDown"
import { ConditionalWComponentSearchWindow, handle_text_field_blur, handle_text_field_change, handle_text_field_render, update_parent_placeholder_css_class } from "./EditableTextSingleLine"
import { useRef, useState } from "preact/hooks"



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



function _EditableText (props: Props)
{
    const [value, set_value] = useState<string>(props.value)
    const [id_insertion_point, set_id_insertion_point] = useState<number | undefined>(undefined)
    const on_focus_set_selection = useRef<[number, number] | undefined>(undefined)


    const { placeholder, on_change, on_blur, disabled, presenting, force_focus } = props

    if ((!on_change && !on_blur) || disabled || presenting)
    {
        return <RichMarkDown text={props.value} />
    }

    const conditional_on_change = (new_value: string) =>
    {
        on_change && on_change(new_value)
        set_value(new_value)
    }


    const class_name = `editable_field ${value ? "" : "placeholder"}`


    return <div className={class_name}>
        <textarea
            ref={el =>
            {
                if (!el) return
                adjust_height(el)
                handle_text_field_render({ id_insertion_point, on_focus_set_selection, el, force_focus })


                // We have initiated a searchWindow to populate an id insertiong so we do not want to
                // focus this input box now
                if (id_insertion_point !== undefined) return

                const position = on_focus_set_selection.current
                on_focus_set_selection.current = undefined

                const should_gain_focus = position || props.force_focus
                if (should_gain_focus)
                {
                    setTimeout(() => {
                        el.focus()
                        if (position) el.setSelectionRange(position[0], position[1])
                    }, 0)
                }
            }}
            placeholder={placeholder}
            value={value}
            style={{ height: "auto" }}
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

export const EditableText = connector(_EditableText) as FunctionalComponent<OwnProps>
