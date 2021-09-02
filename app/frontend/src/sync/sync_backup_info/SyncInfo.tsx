import { Box, Button, IconButton, makeStyles, Tooltip, Typography } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { useState } from "preact/hooks"
import SaveIcon from "@material-ui/icons/Save"
import SyncProblemIcon from "@material-ui/icons/SyncProblem"

import { sentence_case } from "../../shared/utils/sentence_case"
import type { RootState } from "../../state/State"
import { storage_dependent_save } from "../../state/sync/utils/save_state"
import { ACTIONS } from "../../state/actions"
import { get_store } from "../../state/store"



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
    const loading = status === "LOADING"
    const saving = status === "SAVING"
    const overwriting = status === "OVERWRITING"
    const sending_or_recieving = loading || saving || overwriting

    const next_save = next_save_ms && next_save_ms - performance.now()
    const will_save_in_future = next_save !== undefined && next_save >= 0
    const save_in_seconds = next_save !== undefined && next_save >= 0 && Math.round(next_save / 1000)

    if (will_save_in_future) setTimeout(() => update_state({}), 500)


    const useStyles = makeStyles(theme => ({
        button: {
            textTransform: "none",
            "&:hover .show": { fontSize: 0 },
            "&:focus .show": { fontSize: 0 },
            "&:hover .hide": { fontSize: "initial" },
            "&:focus .hide": { fontSize: "initial" }
        },
        animate: {
            transitionProperty: "all",
            transitionDuration: "0.23s"
        },

        initially_hidden: {
            fontSize: 0,
        },
        initially_shown: {
            fontSize: "initial",
        }
    }))

    const classes = useStyles()


    if (!status) return null


    return <Typography component="span">
        <Button
            className={classes.button}
            size="small"
            onClick={async (e: h.JSX.TargetedMouseEvent<HTMLButtonElement>) =>
            {
                e.currentTarget.blur()
                const store = get_store()
                const state = store.getState()
                const throttled_save_state = storage_dependent_save(store.dispatch, state)
                await throttled_save_state.flush()
            }}
            startIcon={failed
                ? <SyncProblemIcon color="error" />
                : <SaveIcon
                    className={sending_or_recieving ? "animate spinning" : ""}
                    titleAccess={sentence_case(status)}
                />
            }
        >
            <Typography
                className={`${classes.animate} ${classes.initially_shown} show`}
                color={(failed) ? "error" : "initial" }
                component="span"
                noWrap={true}
            >
                {failed ? "Failed!" : (will_save_in_future ? `Save in ${save_in_seconds}s` : sentence_case(status))}
            </Typography>
            <Typography
                className={`${classes.animate} ${classes.initially_hidden} hide`}
                component="span"
                noWrap={true}
            >
                {failed ? "Retry Now" : "Save Now"}
            </Typography>
            <Typography component="span">&nbsp;</Typography>

        </Button>
    </Typography>
}

export const SyncInfo = connector(_SyncInfo) as FunctionalComponent<{}>
