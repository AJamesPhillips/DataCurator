import { h } from "preact"
import { Typography } from "@material-ui/core"
import WarningIcon from "@material-ui/icons/Warning"



export function ValuePossibilityDuplicate (props: { warning: string, label?: string })
{
    const { warning, label = "Duplicate" } = props

    return <Typography noWrap variant="caption" title={warning} aria-label={warning} style={{ display: warning ? "inline" : "none" }}>
        <WarningIcon />
        <span style={{ position: "relative", top: -7 }}>{label}</span>
    </Typography>
}
