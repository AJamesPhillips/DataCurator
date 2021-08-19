import { Box } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { useRef } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { WarningTriangle } from "../../sharedf/WarningTriangle"
import type { RootState } from "../../state/State"



const map_state = (state: RootState) =>
{
    return {
        status: state.backup.status,
    }
}

const map_dispatch = {}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _BackupInfo (props: Props)
{
    const timeout = useRef<NodeJS.Timeout>()
    const allow_showing = useRef<boolean>()
    clearTimeout(timeout.current)

    const { status } = props
    const failed = status === "FAILED"
    const status_str = status === "SAVED" ? "Backed up" : (status === "SAVING" ? "Backing up" : "")

    if (status === "SAVED")
    {
        timeout.current = setTimeout(() => allow_showing.current = false, 5000)
    }
    else
    {
        allow_showing.current = true
    }


    if (!allow_showing.current) return null


    return <Box className="backup_info">
        {failed && <div title="Back up failed">
            <WarningTriangle message={"Back up failed"} backgroundColor="red" />
            &nbsp;Backup Failed
        </div>}

        {(!failed && status) && <div>&nbsp;{status_str}</div>}
    </Box>
}

export const BackupInfo = connector(_BackupInfo) as FunctionalComponent<{}>
