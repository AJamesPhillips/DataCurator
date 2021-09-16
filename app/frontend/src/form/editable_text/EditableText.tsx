import { h } from "preact"

import {
    EditableTextCommonOwnProps,
    EditableTextCommon,
    EditableTextComponentArgs,
} from "./editable_text_common"
import { TextField } from "@material-ui/core"



export function EditableText (props: EditableTextCommonOwnProps)
{
    return <EditableTextCommon
        {...props}

        component={({ value, on_render, on_focus, on_change, on_blur }: EditableTextComponentArgs) =>
            <TextField
                fullWidth={true}
                size="small"
                variant="standard"
                label={props.placeholder}
                multiline
                value={value}
                onFocus={on_focus}
                onChange={on_change}
                onBlur={on_blur}
                inputRef={((el: HTMLTextAreaElement) =>
                {
                    if (!el) return
                    on_render(el)
                }) as any}
            />
            // @TODO: Check if ref is still needed and convert to Material syntax if so.
            // <textarea
            //     style={{ height: "auto" }}
            //     placeholder={props.placeholder}
            //     value={value}
            //     ref={el =>
            //     {
            //         if (!el) return
            //         adjust_height(el)
            //         on_render(el)
            //     }}
            //     onFocus={on_focus}
            //     onChange={on_change}
            //     onBlur={on_blur}
            // />
        }
    />
}
