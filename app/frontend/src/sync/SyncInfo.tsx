import { Button, Typography } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import SaveIcon from "@mui/icons-material/Save"
import SyncProblemIcon from "@mui/icons-material/SyncProblem"

import { sentence_case } from "../shared/utils/sentence_case"
import type { RootState } from "../state/State"
import { save_state } from "../state/sync/utils/save_state"
import { ACTIONS } from "../state/actions"
import { get_store } from "../state/store"
import { is_defined } from "../shared/utils/is_defined"



const map_state = (state: RootState) =>
{
    return {
        sync_state_specialised_objects: state.sync.specialised_objects,
        sync_state_bases: state.sync.bases,
        ready_for_writing: state.sync.ready_for_writing,
    }
}

const map_dispatch = {
    update_sync_status: ACTIONS.sync.update_sync_status,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>

function _SyncInfo (props: Props)
{
    const { sync_state_specialised_objects: specialised, sync_state_bases: bases, ready_for_writing } = props
    const failed = specialised.status === "FAILED" || bases.status === "FAILED"
    const loading = specialised.status === "LOADING" || bases.status === "LOADING"
    const saving = specialised.status === "SAVING" || bases.status === "SAVING"
    const error_message = [specialised.error_message, bases.error_message].filter(is_defined).join(", ")
    const sending_or_recieving = loading || saving

    const classes = use_styles()

    let status_text = sentence_case(specialised.status || "")
    if (bases.status && bases.status !== "LOADED" && bases.status !== "SAVED")
    {
        status_text += ((bases.status !== specialised.status) && (", " + sentence_case(bases.status))) || ""
    }
    if (!status_text) return null


    return <Typography component="span">
        <Button
            className={classes.button}
            size="small"
            disabled={!ready_for_writing}
            onClick={async (e: h.JSX.TargetedMouseEvent<HTMLButtonElement>) =>
            {
                e.currentTarget.blur()
                const store = get_store()
                await save_state(store, true)
            }}
            startIcon={failed
                ? <SyncProblemIcon color="error" />
                : <SaveIcon
                    className={sending_or_recieving ? "animate spinning" : ""}
                />
            }
            title={failed ? error_message : status_text}
        >
            <Typography
                className={`${classes.animate} ${classes.initially_shown} show`}
                color={failed ? "error" : "initial" }
                component="span"
                noWrap={true}
            >
                {failed ? "Failed!" : status_text}
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



const use_styles = makeStyles(theme => ({
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
