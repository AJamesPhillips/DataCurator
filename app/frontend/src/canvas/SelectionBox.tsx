import { h } from "preact"



interface Props
{
    client_start_x: number
    client_start_y: number
    client_current_x: number
    client_current_y: number
}

export function SelectionBox (props: Props)
{
    const {
        client_start_x,
        client_start_y,
        client_current_x,
        client_current_y,
    } = props

    const selection_box_style: h.JSX.CSSProperties = {
        left: Math.min(client_start_x, client_current_x),
        top: Math.min(client_start_y, client_current_y),
        width: Math.abs(client_current_x - client_start_x),
        height: Math.abs(client_current_y - client_start_y),
    }

    return <div
        className="selection_box"
        style={selection_box_style}
    />
}
