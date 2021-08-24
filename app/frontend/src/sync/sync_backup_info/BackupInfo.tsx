import { Box } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { useRef, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import "./BackupInfo.scss"
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
    clearTimeout(timeout.current)
    const [allow_showing, set_allow_showing] = useState<boolean | "fade">(true)

    const { status } = props
    const failed = status === "FAILED"
    const saved = status === "SAVED"
    const saving = status === "SAVING"
    const status_str = saved ? "Backed up" : (saving ? "Backing up" : "")

    if (saved)
    {
        if (allow_showing === true) timeout.current = setTimeout(() => set_allow_showing("fade"), 5000)
        else if (allow_showing === "fade") timeout.current = setTimeout(() => set_allow_showing(false), 1000)
    }
    else if (allow_showing !== true)
    {
        set_allow_showing(true)
    }



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
