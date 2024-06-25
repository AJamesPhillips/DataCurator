import { TextField } from "@mui/material"
import { h } from "preact"
import { useMemo } from "preact/hooks"

import {
    EditableTextCommon,
    EditableTextCommonOwnProps,
    EditableTextComponentArgs
} from "./editable_text_common"



export function EditableTextSingleLine (props: EditableTextCommonOwnProps)
{
    const component = useMemo(() =>
    {
        return ({ value, on_render, on_focus, on_change, on_blur, on_key_down }: EditableTextComponentArgs) =>
            <TextField
                fullWidth={true}
                label={props.placeholder}
                variant="outlined"
                value={value}
                onFocus={on_focus}
                onChange={on_change}
                onBlur={on_blur}
                onKeyDown={on_key_down}
                size={props.size}
                inputRef={on_render as any}
                spellcheck={props.spellcheck}
                disabled={props.disabled_input}
                title={props.title}
            />
            // <input type="text"
            //     label={props.placeholder}
            //     value={value}
            //     onFocus={on_focus}
            //     onChange={on_change}
            //     onBlur={on_blur}
            //     onKeyDown={on_key_down}
            //     ref={on_render}
            // />
    }, [props.placeholder, props.size, props.spellcheck, props.disabled_input, props.title])


    return <EditableTextCommon {...props} component={component} />
}
