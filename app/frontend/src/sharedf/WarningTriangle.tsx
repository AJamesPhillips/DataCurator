import { h } from "preact"



interface OwnProps
{
    message: string
    backgroundColor?: string
}

export function WarningTriangle (props: OwnProps)
{
    return <span
        style={{ backgroundColor: props.backgroundColor || "yellow" }}
        title={props.message}
    >{"\u26A0"}</span>
}
