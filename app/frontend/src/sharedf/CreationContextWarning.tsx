import { FunctionalComponent, h } from "preact"
import { IconButton, makeStyles,Tooltip } from "@material-ui/core"

import PhotoFilterIcon from '@material-ui/icons/PhotoFilter';
import type { RootState } from "../state/State";
import { connect, ConnectedProps } from "react-redux";

interface OwnProps {}
const map_state = (state: RootState) => ({
    creation_context: state.creation_context,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>  & OwnProps

function _CreationContextWarning(props: Props)
{
    const { creation_context } = props
    const useStyles = makeStyles(theme => ({
        warning_button: { cursor:"help" },
        warning_icon: { color: theme.palette.warning.main }
      }));
    const classes = useStyles();
    return (creation_context) && (
        <Tooltip placement="top" title="WARNING: creation_context is active, which can result in components being created with inadvertently incorrect information!">
            <IconButton
                className={classes.warning_button}
                component="span"
                disableRipple disableElevation
                size="small"
            >
                <PhotoFilterIcon className={classes.warning_icon} />
            </IconButton>
        </Tooltip>
    )
}

export const CreationContextWarning = connector(_CreationContextWarning) as FunctionalComponent<OwnProps>
