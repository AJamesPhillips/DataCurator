import { h } from "preact"

import { Button as MaterialButton } from "@material-ui/core"
import type { ButtonProps } from "@material-ui/core/Button"



interface SpecificProps
{
    on_pointer_down?: () => void
    on_click?: (e: h.JSX.TargetedMouseEvent<HTMLButtonElement>) => void
    value?: string
}


export function Button (props: ButtonProps & SpecificProps)
{
    return (
        <MaterialButton
            classes={props.classes}
            color={props.color || "primary"}
            component={props.component}
            disabled={props.disabled || false}
            disableElevation={props.disableElevation || true}
            disableFocusRipple={props.disableFocusRipple || false}
            endIcon={props.endIcon}
            fullWidth={props.fullWidth || false}
            href={props.href}
            size={props.size || "small"}
            startIcon={props.startIcon}
            variant={props.variant || "contained"}
            onClick={(e: h.JSX.TargetedMouseEvent<HTMLButtonElement>) =>
            {
                // Not sure we want to put this here
                e.stopImmediatePropagation()
                e.preventDefault()
                props.on_pointer_down && props.on_pointer_down()
                props.on_click && props.on_click(e)
            }}
        >
            { props.children || props.value }
        </MaterialButton>
    )
}
