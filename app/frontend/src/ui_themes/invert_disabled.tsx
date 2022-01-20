import { makeStyles } from "@material-ui/core"



export const invert_disabled_appearance = makeStyles(theme => ({
    inverse_disabled: {
        color: theme.palette.text.disabled,
        "&.Mui-disabled": {
            color: theme.palette.text.primary,
            pointerEvents: "auto",
        }
    }
}))
