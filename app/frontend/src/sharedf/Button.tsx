import { h } from "preact"
import { Button as MaterialButton } from "@material-ui/core"
import type { ButtonProps } from "@material-ui/core/Button"
import { Hidden } from "@material-ui/core"



interface SpecificProps
{
    value?: string
    title?: string
    is_hidden?: boolean
    onPointerDown?: (e: h.JSX.TargetedPointerEvent<HTMLButtonElement>) => void
    onClick?: (e: h.JSX.TargetedPointerEvent<HTMLButtonElement>) => void
}

export function Button (props: ButtonProps & SpecificProps)
{

    return (
        <Hidden xsUp={props.is_hidden} title={props.title}>
            <MaterialButton
                title={props.title}
                color={props.color || "primary"}
                style={props.style}
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
                onPointerDown={(e: h.JSX.TargetedPointerEvent<HTMLButtonElement>) =>
                {
                    // Causes button focus and other elements to blur & their form onblur handlers to
                    // fire, triggering any ob_change handlers
                    e.currentTarget.focus()
                    // Not sure we want to put this here
                    e.stopImmediatePropagation()
                    e.preventDefault()
                    // Using onPointerDown otherwise other onPointerDown on parent elements fire
                    // and the onClick here never gets to fire
                    props.onPointerDown && props.onPointerDown(e)
                }}
                onClick={(e: h.JSX.TargetedPointerEvent<HTMLButtonElement>) =>
                {
                    // Causes button focus and other elements to blur & their form onblur handlers to
                    // fire, triggering any ob_change handlers
                    e.currentTarget.focus()
                    // Not sure we want to put this here
                    e.stopImmediatePropagation()
                    e.preventDefault()
                    props.onClick && props.onClick(e)
                }}
            >
                { props.children || props.value }
            </MaterialButton>
        </Hidden>
    )
}