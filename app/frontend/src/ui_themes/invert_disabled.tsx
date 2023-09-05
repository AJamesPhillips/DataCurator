import makeStyles from "@mui/styles/makeStyles"



export const invert_disabled_appearance = makeStyles(theme => ({
    inverse_disabled: {
        color: theme.palette.text.disabled,
        "&.Mui-disabled": {
            color: theme.palette.text.primary,
            pointerEvents: "auto",
        }
    }
}))
