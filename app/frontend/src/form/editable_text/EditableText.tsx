
import { TextField } from "@mui/material"
import {
    EditableTextCommon,
    EditableTextCommonOwnProps,
    EditableTextComponentArgs,
} from "./editable_text_common"



export function EditableText (props: EditableTextCommonOwnProps)
{
    return <EditableTextCommon
        {...props}

        component={({ value, on_render, on_focus, on_change, on_blur }: EditableTextComponentArgs) =>
        {
            return <TextField
                fullWidth={true}
                size="small"
                variant="standard"
                label={props.placeholder}
                multiline
                value={value}
                onFocus={on_focus}
                onChange={on_change}
                onBlur={on_blur}
                inputRef={on_render}
                spellcheck={props.spellcheck}
            />
            // return <textarea
            //     style={{ height: "auto" }}
            //     placeholder={props.placeholder}
            //     value={value}
            //     onFocus={on_focus}
            //     onChange={on_change}
            //     onBlur={on_blur}
            //     onKeyDown={on_key_down}
            //     ref={on_render}
            // />
        }}
    />
}
