import { h } from "preact"

import "./StorageOption.scss"



interface OwnProps
{
    name: string
    description: h.JSX.Element
    selected: boolean
    on_click: () => void
}


export function StorageOption (props: OwnProps)
{
    const { selected } = props

    return <div
        className={"section storage_option " + (selected ? "selected" : "") }
        onClick={props.on_click}
    >
        <h3>{props.name}</h3>
        {props.description}
    </div>
}
