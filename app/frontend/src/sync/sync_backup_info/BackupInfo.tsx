import { Box, Button, IconButton, Tooltip, Typography } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { useRef, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"


import "./BackupInfo.scss"
import WarningIcon from '@material-ui/icons/Warning';
import BackupIcon from '@material-ui/icons/Backup';
import CloudIcon from '@material-ui/icons/Cloud';
import CloudCircleIcon from '@material-ui/icons/CloudCircle';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import type { RootState } from "../../state/State"

const map_state = (state: RootState) =>
{
    return {
        status: state.backup.status,
        not_solid: state.sync.storage_type !== "solid",
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

    const { status, not_solid } = props

    if (!not_solid) return null

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
        (failed || status) && <Tooltip title={status_str}>
            <IconButton component="span" size="small" aria-label={status_str}>
                {(failed) &&  <CloudUploadIcon  color="error" titleAccess={status_str} />}
                {/* {(status && status.toLowerCase().endsWith('ing')) && <CloudUploadIcon color="action"  titleAccess={status_str} />} */}
                {(status) && <CloudIcon titleAccess={status_str} className={(status?.toLowerCase().endsWith('ing')) ? "animate spinning" : ""} />}
            </IconButton>
        </Tooltip>
    )
}

export const BackupInfo = connector(_BackupInfo) as FunctionalComponent<{}>
