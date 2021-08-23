import { Box } from "@material-ui/core"
import { h } from "preact"

import { BackupInfo } from "./BackupInfo"
import { SyncInfo } from "./SyncInfo"



export function SyncBackupInfo (props: {})
{
    return <Box display="flex">
        <SyncInfo />
        <BackupInfo />
    </Box>
}
