import { h } from "preact"



interface OwnProps
{
    message: string
}

export function WarningTriangle (props: OwnProps)
{
    return <span
        style={{ backgroundColor: "yellow" }}
        title={props.message}
    >{"\u26A0"}</span>
}
