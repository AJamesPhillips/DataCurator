import { Box } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { sentence_case } from "../../shared/utils/sentence_case"

import { WarningTriangle } from "../../sharedf/WarningTriangle"
import type { RootState } from "../../state/State"



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
    const { status } = props
    const failed = status === "FAILED"


    return <Box>
        {failed && <div title={props.error_message}>
            <WarningTriangle message={props.error_message} backgroundColor="red" />
            &nbsp;Save Failed
        </div>}

        {(!failed && status) && <div>{sentence_case(status)}</div>}
    </Box>
}

export const SyncInfo = connector(_SyncInfo) as FunctionalComponent<{}>
