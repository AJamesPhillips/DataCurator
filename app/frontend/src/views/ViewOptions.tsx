import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { Button, ButtonGroup, makeStyles, Typography } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit"
import PresentToAllIcon from "@material-ui/icons/PresentToAll"
import { grey, teal, yellow } from "@material-ui/core/colors";

const map_state = (state: RootState) =>
{
    return {
        presenting: state.display_options.consumption_formatting,
    }
}

const map_dispatch = {
    toggle_consumption_formatting: ACTIONS.display.toggle_consumption_formatting,
    change_route: ACTIONS.routing.change_route,
}
const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: grey[400],
        color:grey[600]
    },
}));
const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>
function _ViewOptions (props: Props)
{
    const classes = useStyles();
    return (
        <ButtonGroup size="small"
            disableElevation
            variant="contained"
            value={props.presenting ? "presenting" : "editing"}
        >
            <Button
                className={classes.root}
                value="editing"
                onClick={props.toggle_consumption_formatting}
                disabled={(!props.presenting) ? true : false }
            >
                <EditIcon />
            </Button>
            <Button
                className={classes.root}
                value="presenting"
                onClick={props.toggle_consumption_formatting}
                disabled={(props.presenting) ? true : false }
            >
                <PresentToAllIcon />
            </Button>
        </ButtonGroup>
    )
}

export const ViewOptions = connector(_ViewOptions) as FunctionalComponent<{}>
