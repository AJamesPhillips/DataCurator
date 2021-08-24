import { Box, Paper } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { useRef } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import WarningIcon from '@material-ui/icons/Warning';
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

    return (
        (failed || status) &&  <Box display="flex" height={1} alignItems="stretch">
            <Box display="flex" alignItems="center">
                <Box component="strong">Backup Status: </Box>
                {failed && <Box component="span" display="inline-flex" alignItems="center">
                    <WarningIcon color="error" titleAccess="Back up failed"  />
                    <Box component="span">Backup Failed</Box>
                </Box>}
                {(!failed && status) && <Box component="span">{status_str}</Box>}
            </Box>
        </Box>
    )
}

export const BackupInfo = connector(_BackupInfo) as FunctionalComponent<{}>
