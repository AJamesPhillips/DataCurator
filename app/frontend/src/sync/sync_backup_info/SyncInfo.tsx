import { Box, Button } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { useState } from "preact/hooks"

import "./SyncInfo.scss"
import { sentence_case } from "../../shared/utils/sentence_case"
import type { RootState } from "../../state/State"
import { throttled_save_state } from "../../state/sync/utils/save_state"
import { ACTIONS } from "../../state/actions"
import WarningIcon from '@material-ui/icons/Warning';
import SaveIcon from '@material-ui/icons/Save';


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
    // console .log("next_save_ms...", next_save_ms)
    const failed = status === "FAILED"
    const saving = status === "SAVING"
    const next_save = next_save_ms && next_save_ms - performance.now()
    const will_save_in_future = next_save !== undefined && next_save >= 0
    const save_in_seconds = next_save !== undefined && next_save >= 0 && Math.round(next_save / 1000)

    if (will_save_in_future) setTimeout(() => update_state({}), 500)
    return(
        <Box display="flex" height={1} alignItems="stretch" id="save_info_and_retries">
            {(failed || status) && <Box display="flex" alignItems="center">
                 <Box component="strong">Sync Status: </Box>
                {failed && <Box component="span" display="inline-flex" alignItems="center">
                    <WarningIcon color="error" titleAccess={props.error_message}  />

                    <Button
                        disableElevation={true}
                        variant="contained"
                        color="primary"
                        onClick={() =>
                        {
                            props.update_sync_status({ status: "RETRYING" })
                        }}
                    >
                        <Box component="span" className="spacer">&nbsp;</Box>
                        <Box component="span" id="save_failed_message">Save Failed</Box>
                        <Box component="span" id="trigger_manual_save" fontSize={0}>
                            Retry Save
                        </Box>
                    </Button>

                </Box>}
                {(!failed && status) && <Box component="span">{sentence_case(status)}</Box>}
            </Box>}

            {will_save_in_future && <Box ml={5}>
                <Button
                    disableElevation={true}
                    variant="contained"
                    color="primary"
                    endIcon={<SaveIcon />}
                    onClick={() =>
                    {
                        throttled_save_state.flush()
                        props.set_next_sync_ms({ next_save_ms: undefined })
                    }}
                >
                    <Box component="span" className="spacer">&nbsp;</Box>
                    <Box component="span" id="save_timer">
                        Save in {save_in_seconds}s {props.error_message}
                    </Box>
                    <Box component="span" id="trigger_manual_save" fontSize={0}>
                        Manual Save
                    </Box>
                </Button>
            </Box>}
        </Box>
    )
}

export const SyncInfo = connector(_SyncInfo) as FunctionalComponent<{}>
