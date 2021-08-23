import { FunctionalComponent, h } from "preact"
import { useRef, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import "./BackupInfo.scss"
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


    if (!allow_showing) return null
    else if (failed)
    {
        return <div title="Back up failed">
            <WarningTriangle message={"Back up failed"} backgroundColor="red" />
            &nbsp;Backup Failed
        </div>
    }
    else if (status)
    {
        return <div className={"backup_info " + (allow_showing === "fade" ? "fade" : "")}>
            {saving && <span><WarningTriangle message="Saving" backgroundColor="yellow" />&nbsp;</span>}
            {status_str}
        </div>
    }


    return null
}

export const BackupInfo = connector(_BackupInfo) as FunctionalComponent<{}>
