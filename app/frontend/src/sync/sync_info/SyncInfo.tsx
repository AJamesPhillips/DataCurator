import { Box } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./SyncInfo.scss"
import { sentence_case } from "../../shared/utils/sentence_case"
import { WarningTriangle } from "../../sharedf/WarningTriangle"
import type { RootState } from "../../state/State"
import { throttled_save_state } from "../../state/sync/utils/save_state"
import { ACTIONS } from "../../state/actions"



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
    const { status, next_save_ms } = props
    const failed = status === "FAILED"
    const next_save = next_save_ms && next_save_ms - performance.now()


    return <Box className="sync_info">
        {failed && <div title={props.error_message}>
            <WarningTriangle message={props.error_message} backgroundColor="red" />
            &nbsp;Save Failed
        </div>}

        {(!failed && status) && <div>{sentence_case(status)}</div>}

        {next_save !== undefined && next_save > 0 && <div
            className="async_save"
        >
            <WarningTriangle message={props.error_message} backgroundColor="yellow" />
            &nbsp;
            <span className="next_save_info">Save in {Math.round(next_save / 1000)}s</span>
            <span
                className="manual_save"
                onClick={() =>
                {
                    throttled_save_state.flush()
                    props.set_next_sync_ms({ next_save_ms: undefined })
                }}
            >Manual save</span>
        </div>}
    </Box>
}

export const SyncInfo = connector(_SyncInfo) as FunctionalComponent<{}>
