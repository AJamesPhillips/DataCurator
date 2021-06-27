import { h } from "preact"
import { Button as MaterialButton } from "@material-ui/core"
import type { ButtonProps } from "@material-ui/core/Button"



interface SpecificProps
{
    value?: string,
	is_hidden?: boolean
}

export function Button (props: ButtonProps & SpecificProps)
{
	if (props.is_hidden) return null
    return (
        <MaterialButton
            title={props.title}
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
            onPointerDown={(e: h.JSX.TargetedMouseEvent<HTMLButtonElement>) =>
            {
                // Not sure we want to put this here
                e.stopImmediatePropagation()
                e.preventDefault()
                // Using onPointerDown otherwise other onPointerDown on parent elements fire
                // and the onClick here never gets to fire
                props.onPointerDown ? props.onPointerDown(e) : (props.onClick && props.onClick(e))
            }}
        >
            { props.children || props.value }
        </MaterialButton>
    )
}