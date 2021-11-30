import { makeStyles } from "@material-ui/core"



export const active_warning_styles = makeStyles(theme => ({
    warning_button: { cursor: "help" },
    warning_icon: { color: theme.palette.warning.main }
}))
