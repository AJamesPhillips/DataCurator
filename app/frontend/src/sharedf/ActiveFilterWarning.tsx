import { FunctionalComponent, h } from "preact"
import { IconButton, makeStyles,Tooltip } from "@material-ui/core"
import { connect, ConnectedProps } from "react-redux"
import FilterNoneIcon from '@material-ui/icons/FilterNone'

import type { RootState } from "../state/State"



const map_state = (state: RootState) => ({
    apply_filter: state.filter_context.apply_filter,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



function _ActiveFilterWarning(props: Props)
{
    const { apply_filter } = props
    const classes = use_styles()

    if (!apply_filter) return null


    return <Tooltip placement="top" title="WARNING: a filter is in place which could result in components being hidden.">
        <IconButton
            className={classes.warning_button}
            component="span"
            disableRipple disableElevation
            size="small"
        >
            <FilterNoneIcon className={classes.warning_icon} />
        </IconButton>
    </Tooltip>
}

export const ActiveFilterWarning = connector(_ActiveFilterWarning) as FunctionalComponent<{}>



const use_styles = makeStyles(theme => ({
    warning_button: { cursor: "help" },
    warning_icon: { color: theme.palette.warning.main },
}))
