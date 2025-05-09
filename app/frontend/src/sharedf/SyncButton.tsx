import SyncIcon from "@mui/icons-material/Sync"
import SyncProblemIcon from "@mui/icons-material/SyncProblem"
import { h } from "preact"

import type { AsyncState } from "../utils/async_state"



interface Props
{
    state: AsyncState
    text?: string
    title?: string
    on_click: () => void
    style?: h.JSX.CSSProperties
}

export function SyncButton (props: Props)
{
    const { state, text = "Refresh", title = "Refresh", on_click, style } = props
    const error = state === "error"

    return <span title={title} onClick={on_click} style={style}>
        {text}
        {!error && <SyncIcon className={state === "in_progress" ? "animate spinning" : ""} />}
        {error && <SyncProblemIcon />}
    </span>
}
