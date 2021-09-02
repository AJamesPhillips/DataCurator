import { h } from "preact"

import {
    EditableTextCommonOwnProps,
    EditableTextCommon,
    EditableTextComponentArgs,
} from "./editable_text_common"
import { adjust_height } from "../utils"
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
                ref={((el: HTMLDivElement) =>
                {
                    if (!el) return
                    const textarea = el.getElementsByTagName("textarea")[0]
                    if (!textarea) return
                    on_render(textarea)
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
