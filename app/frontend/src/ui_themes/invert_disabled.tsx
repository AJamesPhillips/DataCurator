import { makeStyles } from "@material-ui/core";

export const invertDisabledAppearance = makeStyles(theme => ({
    inverse_disabled: {
        color:theme.palette.text.disabled,
        "&.Mui-disabled": {
            color:theme.palette.text.primary,
        }
    }
}))
