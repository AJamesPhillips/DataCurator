import { TextField } from "@material-ui/core"
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
        return ({ value, on_render, on_focus, on_change, on_blur }: EditableTextComponentArgs) =>
            <TextField
                fullWidth={true}
                label={props.placeholder}
                variant="outlined"
                value={value}
                onFocus={on_focus}
                onChange={on_change}
                onBlur={on_blur}
                size={props.size}
                inputRef={((el: HTMLInputElement) =>
                {
                    if (!el) return
                    on_render(el)
                }) as any}
            />
    }, [props.placeholder, props.size])


    return <EditableTextCommon {...props} component={component} />
}
