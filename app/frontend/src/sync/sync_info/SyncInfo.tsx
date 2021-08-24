import { Box, Button, IconButton, Paper } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./SyncInfo.scss"
import { sentence_case } from "../../shared/utils/sentence_case"
import { WarningTriangle } from "../../sharedf/WarningTriangle"
import type { RootState } from "../../state/State"
import { throttled_save_state } from "../../state/sync/utils/save_state"
import { ACTIONS } from "../../state/actions"
import { useState } from "preact/hooks"
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
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _SyncInfo (props: Props)
{
    const [, update_state] = useState({})

    const { status, next_save_ms } = props
    const failed = status === "FAILED"
    const next_save = next_save_ms && next_save_ms - performance.now()
    const will_save_in_future = next_save !== undefined && next_save >= 0
    const save_in_seconds = next_save !== undefined && next_save >= 0 && Math.round(next_save / 1000)

    if (will_save_in_future) setTimeout(() => update_state({}), 500)
    let isHovered:boolean = false;

    // <Button>{sentence_case(status)}</Button>
    {/* {(status.toLowerCase() == 'saved') && <SaveIcon titleAccess={sentence_case(status)} />} */}
    // height={1}
    return(
        <Box display="flex" height={1} alignItems="stretch">
            {(failed || status) && <Box display="flex" alignItems="center">
                 <Box component="strong">Sync Status: </Box>
                {failed && <Box component="span" display="inline-flex" alignItems="center">
                    <WarningIcon color="error" titleAccess={props.error_message}  />
                    <Box component="span">Save Failed</Box>
                </Box>}
                {(!failed && status) && <Box component="span">{sentence_case(status)}</Box>}
            </Box>}

            {will_save_in_future && <Box ml={5}>
                <Button
                    id="save_timer_manual_save_trigger"
                    disableElevation={true}
                    variant="contained"
                    color="primary"
                    endIcon={<SaveIcon />}
                    onClick={() =>{
                        throttled_save_state.flush()
                        props.set_next_sync_ms({ next_save_ms: undefined })
                    }}>
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
