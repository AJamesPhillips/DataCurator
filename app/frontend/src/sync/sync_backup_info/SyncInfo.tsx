import { Box, Button, makeStyles, Typography } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { useState } from "preact/hooks"
import { sentence_case } from "../../shared/utils/sentence_case"
import type { RootState } from "../../state/State"
import { throttled_save_state } from "../../state/sync/utils/save_state"
import { ACTIONS } from "../../state/actions"
import SyncIcon from '@material-ui/icons/Sync';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';

const map_state = (state: RootState) =>
{
    return {
        status: state.sync.status,
        error_message: state.sync.error_message,
        next_save_ms: state.sync.next_save_ms,
    }
}

const map_dispatch = {
    set_next_sync_ms: ACTIONS.sync.set_next_sync_ms,
    update_sync_status: ACTIONS.sync.update_sync_status,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>

function _SyncInfo (props: Props)
{
    const [, update_state] = useState({})

    const { status, next_save_ms } = props
    const failed = status === "FAILED"
    const saving = status === "SAVING"
    const next_save = next_save_ms && next_save_ms - performance.now()
    const will_save_in_future = next_save !== undefined && next_save >= 0
    const save_in_seconds = next_save !== undefined && next_save >= 0 && Math.round(next_save / 1000)

    if (will_save_in_future) setTimeout(() => update_state({}), 500)
    const useStyles = makeStyles(theme => ({
        button: {
            textTransform:"none",

            "&:hover .show": { fontSize:0 },
            "&:hover .hide": { fontSize:"initial" }
        },
        animate: {
            transitionProperty: "all",
            transitionDuration: "0.23s"
        },

        initially_hidden: {
            fontSize:0,
        },
        initially_shown: {
            fontSize:"initial",
        }
      }));
    const classes = useStyles();

    return (
        <Typography m={0} noWrap={true}>
            {(!failed && status && !will_save_in_future) &&
                <SyncIcon className={(status?.toLowerCase().endsWith('ing')) ? "animate spinning" : ""} titleAccess={sentence_case(status)} />
            }
            {(will_save_in_future || failed) && <Button
                    className={classes.button}
                    size="small"
                    onClick={() => {
                        if (failed) {
                            props.update_sync_status({ status: "RETRYING" })
                        } else {
                            throttled_save_state.flush()
                            props.set_next_sync_ms({ next_save_ms: undefined })
                        }
                    }}
                    startIcon={(failed)
                        ? <SyncProblemIcon color="error" />
                        : (status)
                            ? <SyncIcon className={(status?.toLowerCase().endsWith('ing')) ? "animate spinning" : ""} titleAccess={sentence_case(status)} />
                            : <SyncIcon />
                    }
                >
                    <Box component="span">
                        <Typography component="span" color={(failed) ? "error" : "initial" } className={`${classes.animate} ${classes.initially_shown} show`}>
                            {(!failed) && `Save in ${save_in_seconds}s`}
                            {(failed) && `Failed!`}
                        </Typography>
                        <Typography  component="span" className={`${classes.animate} ${classes.initially_hidden} hide`}>
                            {(!failed) && `Save Now`}
                            {(failed) && `Retry Now`}
                        </Typography>
                        <Typography component="span">&nbsp;</Typography>
                    </Box>
                </Button> }
        </Typography>
    )
}

export const SyncInfo = connector(_SyncInfo) as FunctionalComponent<{}>
