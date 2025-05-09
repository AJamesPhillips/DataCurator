import WarningIcon from "@mui/icons-material/Warning"
import { Typography } from "@mui/material"


interface Props
{
    warning: string
    always_display?: boolean
    label?: string
}

export function WarningTriangleV2 (props: Props)
{
    const { warning, label = "", always_display = false } = props
    const display = (warning || always_display) ? "inline" : "none"

    return <Typography
        noWrap
        variant="caption"
        title={warning}
        aria-label={warning}
        style={{ display }}
    >
        <WarningIcon />
        <span style={{ position: "relative", top: -7 }}>{label}</span>
    </Typography>
}
