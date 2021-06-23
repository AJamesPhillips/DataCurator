import { h } from "preact"

import { Button as MaterialButton } from "@material-ui/core"
import type  { ButtonProps } from "@material-ui/core/Button"

export function Button (props: ButtonProps)
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
          variant={props.variant || "contained"}>
          { props.children }
        </MaterialButton>
    )
}
