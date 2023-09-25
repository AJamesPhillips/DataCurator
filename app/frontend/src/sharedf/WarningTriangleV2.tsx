import { Typography } from "@mui/material"
import WarningIcon from "@mui/icons-material/Warning"



export function WarningTriangleV2 (props: { warning: string, label?: string })
{
    const { warning, label = "" } = props

    return <Typography noWrap variant="caption" title={warning} aria-label={warning} style={{ display: warning ? "inline" : "none" }}>
        <WarningIcon />
        <span style={{ position: "relative", top: -7 }}>{label}</span>
    </Typography>
}
