import { Hidden, Button as MaterialButton } from "@mui/material"
import type { ButtonProps } from "@mui/material/Button"
import { h } from "preact"

import "./Button.scss"



interface SpecificProps
{
    value?: string
    title?: string
    is_hidden?: boolean
    onPointerDown?: (e: h.JSX.TargetedPointerEvent<HTMLButtonElement>) => void
    onClick?: (e: h.JSX.TargetedPointerEvent<HTMLButtonElement>) => void
    className?: string
}

export function Button (props: ButtonProps & SpecificProps)
{

    return (
        <Hidden xsUp={props.is_hidden}>
            <MaterialButton
                className={props.className}
                title={props.title}
                color={props.color || "primary"}
                // 2023-03-21: Forcing pointer-events to `initial` allows the
                // title to show even when button is disabled, this may break
                // other things.
                style={{ ...props.style, pointerEvents: "initial" }}
                // component={props.component}
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
                    if (props.onPointerDown) props.onPointerDown(e)
                }}
                onClick={(e: h.JSX.TargetedPointerEvent<HTMLButtonElement>) =>
                {
                    // Causes button focus and other elements to blur & their form onblur handlers to
                    // fire, triggering any ob_change handlers
                    e.currentTarget.focus()
                    // Not sure we want to put this here
                    e.stopImmediatePropagation()
                    e.preventDefault()
                    if (props.onClick) props.onClick(e)
                }}
            >
                { props.children || props.value }
            </MaterialButton>
        </Hidden>
    )
}
