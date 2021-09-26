import { Button, makeStyles, Typography } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { useState } from "preact/hooks"
import SaveIcon from "@material-ui/icons/Save"
import SyncProblemIcon from "@material-ui/icons/SyncProblem"

import { sentence_case } from "../shared/utils/sentence_case"
import type { RootState } from "../state/State"
import { storage_dependent_save } from "../state/sync/utils/save_state"
import { ACTIONS } from "../state/actions"
import { get_store } from "../state/store"
import { is_defined } from "../shared/utils/is_defined"



const map_state = (state: RootState) =>
{
    return {
        sync_state_specialised_objects: state.sync.specialised_objects,
        sync_state_bases: state.sync.bases,
    }
}

const map_dispatch = {
    update_sync_status: ACTIONS.sync.update_sync_status,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>

function _SyncInfo (props: Props)
{
    const [, update_state] = useState({})

    const { sync_state_specialised_objects: specialised, sync_state_bases: bases } = props
    const failed = specialised.status === "FAILED" || bases.status === "FAILED"
    const loading = specialised.status === "LOADING" || bases.status === "LOADING"
    const saving = specialised.status === "SAVING" || bases.status === "SAVING"
    const error_message = [specialised.error_message, bases.error_message].filter(is_defined).join(", ")
    // const overwriting = status === "OVERWRITING"
    const sending_or_recieving = loading || saving //|| overwriting

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
            onClick={async (e: h.JSX.TargetedMouseEvent<HTMLButtonElement>) =>
            {
                e.currentTarget.blur()
                const store = get_store()
                const state = store.getState()
                await storage_dependent_save(store.dispatch, state)
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
