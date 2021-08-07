import { Box } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { WarningTriangle } from "../sharedf/WarningTriangle"
import type { RootState } from "../state/State"



const map_state = (state: RootState) =>
{
    return {
        status: state.sync.status,
        error_message: state.sync.error_message,
    }
}

const map_dispatch = {}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _SyncInfo (props: Props)
{
    const failed = props.status === "FAILED"
    const saving = props.status === "SAVING"
    const saved = props.status === undefined


    return <Box>
        {failed && <div title={props.error_message}>
            <WarningTriangle message={props.error_message} backgroundColor="red" />
            &nbsp;Save Failed
        </div>}

        {saved && <div>Saved</div>}
        {saving && <div>Saving</div>}
    </Box>
}

export const SyncInfo = connector(_SyncInfo) as FunctionalComponent<{}>
