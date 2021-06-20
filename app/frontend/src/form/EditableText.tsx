import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { useEffect, useRef, useState } from "preact/hooks"

import "./Editable.css"
import { RichMarkDown } from "../sharedf/RichMarkDown"
import type { RootState } from "../state/State"
import { ConditionalWComponentSearchWindow } from "./ConditionalWComponentSearchWindow"
import { handle_text_field_render, handle_text_field_change, handle_text_field_blur, handle_text_field_focus } from "./editable_text_common"
import { adjust_height } from "./utils"
import { ACTIONS } from "../state/actions"



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


const map_dispatch = {
    set_editing_text_flag: ACTIONS.user_activity.set_editing_text_flag,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _EditableText (props: Props)
{
    const [value, set_value] = useState<string>(props.value)
    useEffect(() => set_value(props.value), [props.value])


    const [id_insertion_point, set_id_insertion_point] = useState<number | undefined>(undefined)
    const on_focus_set_selection = useRef<[number, number] | undefined>(undefined)


    const { placeholder, on_change, on_blur, disabled, presenting, force_focus, set_editing_text_flag } = props

    if ((!on_change && !on_blur) || disabled || presenting)
    {
        return <RichMarkDown text={value} />
    }

    const conditional_on_change = (new_value: string) =>
    {
        on_change && on_change(new_value)
        set_value(new_value)
    }


    const class_name = `editable_field ${value ? "" : "placeholder"}`


    return <div className={class_name}>
        <textarea
            style={{ height: "auto" }}
            placeholder={placeholder}
            value={value}
            ref={el =>
            {
                if (!el) return
                adjust_height(el)
                handle_text_field_render({ id_insertion_point, on_focus_set_selection, el, force_focus })
            }}
            onFocus={e => handle_text_field_focus({ e, set_editing_text_flag })}
            onChange={e => {
                handle_text_field_change({ e, set_id_insertion_point, conditional_on_change })
            }}
            onBlur={e => {
                handle_text_field_blur({ e, conditional_on_change, on_blur, set_editing_text_flag })
            }}
        />


        {id_insertion_point !== undefined && <ConditionalWComponentSearchWindow
            value={value}
            id_insertion_point={id_insertion_point}
            set_id_insertion_point={set_id_insertion_point}
            on_focus_set_selection={on_focus_set_selection}
            conditional_on_change={conditional_on_change}
        />}
    </div>
}

export const EditableText = connector(_EditableText) as FunctionalComponent<OwnProps>
