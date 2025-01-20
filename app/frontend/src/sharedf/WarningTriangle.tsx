

interface OwnProps
{
    message?: string
    backgroundColor?: string
}

export function WarningTriangle (props: OwnProps)
{
    const warning_triangle = "\u26A0" // ⚠

    return <span
        style={{ backgroundColor: props.backgroundColor || "yellow", color: "black" }}
        title={props.message}
    >
        {warning_triangle}
    </span>
}
