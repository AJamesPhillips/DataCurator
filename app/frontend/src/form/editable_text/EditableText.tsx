import { h } from "preact"

import {
    EditableTextCommonOwnProps,
    EditableTextCommon,
    EditableTextComponentArgs,
} from "./editable_text_common"
import { adjust_height } from "../utils"



export function EditableText (props: EditableTextCommonOwnProps)
{
    return <EditableTextCommon
        {...props}

        component={({ value, on_render, on_focus, on_change, on_blur }: EditableTextComponentArgs) =>
            <textarea
                style={{ height: "auto" }}
                placeholder={props.placeholder}
                value={value}
                ref={el =>
                {
                    if (!el) return
                    adjust_height(el)
                    on_render(el)
                }}
                onFocus={on_focus}
                onChange={on_change}
                onBlur={on_blur}
            />
        }
    />
}
