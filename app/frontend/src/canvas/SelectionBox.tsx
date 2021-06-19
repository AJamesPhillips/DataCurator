import { h } from "preact"

import "./SelectionBox.css"



interface Props
{
    client_start_x: number
    client_start_y: number
    client_end_x: number
    client_end_y: number
    color: "blue" | "red"
}

export function SelectionBox (props: Props)
{
    const {
        client_start_x,
        client_start_y,
        client_end_x,
        client_end_y,
    } = props

    const selection_box_style: h.JSX.CSSProperties = {
        left: client_start_x,
        top: client_start_y,
        width: client_end_x - client_start_x,
        height: client_end_y - client_start_y,
    }

    return <div
        className={`selection_box color_${props.color}`}
        style={selection_box_style}
    />
}
