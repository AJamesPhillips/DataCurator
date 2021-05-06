import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./Editable.css"
import type { RootState } from "../state/State"
import { adjust_height } from "./utils"
import { RichMarkDown } from "../sharedf/RichMarkDown"
import { ConditionalWComponentSearchWindow, handle_text_field_change } from "./EditableTextSingleLine"
import { useState } from "preact/hooks"



interface OwnProps
{
    placeholder: string
    value: string
    on_change?: (new_value: string) => void
}



const map_state = (state: RootState) => ({
    rich_text: state.display.rich_text_formatting,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _EditableText (props: Props)
{
    const [id_insertion_point, set_id_insertion_point] = useState<number | undefined>(undefined)

    const { placeholder, value, on_change, rich_text } = props

    if (!on_change || rich_text)
    {
        return <RichMarkDown text={props.value} />
    }

    const conditional_on_change = (new_value: string) => new_value !== props.value && on_change(new_value)

    return <div class={"editable_field " + (!value ? " placeholder " : "")}>
        <textarea
            ref={el => adjust_height(el)}
            placeholder={placeholder}
            value={value}
            style={{ height: "auto" }}
            // onKeyDown={e => e.stopPropagation()}
            // onKeyUp={e => e.stopPropagation()}
            // onKeyPress={e => e.stopPropagation()}
            // onChange={e => this.setState({ value: e.currentTarget.value })}
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

export const EditableText = connector(_EditableText) as FunctionalComponent<OwnProps>
