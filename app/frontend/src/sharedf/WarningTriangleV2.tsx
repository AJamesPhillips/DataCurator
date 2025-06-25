import WarningIcon from "@mui/icons-material/Warning"
import { Typography } from "@mui/material"
import { CSSProperties } from "preact/compat"


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
        // We want it to wrap for the ExperimentalFeatures -> ExperimentalWarning
        // component, otherwise the message does not fit in the page.
        // noWrap
        variant="caption"
        title={warning}
        aria-label={warning}
        style={{ display }}
    >
        <WarningIcon />
        <span style={{ position: "relative", top: -7, wordBreak: "" }}>{label}</span>
    </Typography>
}


export function ErrorOrWarningTriangleV2 (props: { message: string, is_error: boolean })
{
    const { message } = props

    const css: CSSProperties = {
        display: "flex",
        color: props.is_error ? "black" : "lightgrey",
    }

    return <div style={{
        ...css,
        overflow: "hidden",
        maxHeight: message.length ? 100 : 0,
        maxWidth: message.length ? 100 : 0,
        transition: "max-height 1s ease, max-width 1s ease, color 1s ease",
    }}>
        <WarningTriangleV2 warning={message} always_display={true} />
    </div>
}
