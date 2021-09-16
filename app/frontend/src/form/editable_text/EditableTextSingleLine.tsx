import { TextField } from "@material-ui/core"
import { h } from "preact"

import {
    EditableTextCommon,
    EditableTextCommonOwnProps,
    EditableTextComponentArgs
} from "./editable_text_common"



export function EditableTextSingleLine (props: EditableTextCommonOwnProps)
{

    return <EditableTextCommon
        {...props}
        component={({ value, on_render, on_focus, on_change, on_blur }: EditableTextComponentArgs) =>
            <TextField
                fullWidth={true}
                label={props.placeholder}
                variant="outlined"
                value={value}
                onFocus={on_focus}
                onChange={on_change}
                onBlur={on_blur}
                inputRef={((el: HTMLInputElement) =>
                {
                    if (!el) return
                    on_render(el)
                }) as any}
            />
            // @TODO: Check if ref is still needed and convert to Material syntax if so.
            // <input
            //     type="text"
            //     placeholder={props.placeholder}
            //     value={value}
            //     ref={el =>
            //     {
            //         if (!el) return
            //         on_render(el)
            //     }}
            //     onFocus={on_focus}
            //     onChange={on_change}
            //     onBlur={on_blur}
            // />
        }
    />
}
