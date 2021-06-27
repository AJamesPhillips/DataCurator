import { h } from "preact"

import "./SelectionBox.css"



interface Props
{
    canvas_start_x: number
    canvas_start_y: number
    canvas_end_x: number
    canvas_end_y: number
    color: "blue" | "red"
}

export function SelectionBox (props: Props)
{
    const {
        canvas_start_x,
        canvas_start_y,
        canvas_end_x,
        canvas_end_y,
    } = props

    const selection_box_style: h.JSX.CSSProperties = {
        left: canvas_start_x,
        top: -canvas_end_y,
        width: canvas_end_x - canvas_start_x,
        height: canvas_end_y - canvas_start_y,
    }

    return <div
        className={`selection_box color_${props.color}`}
        style={selection_box_style}
    />
}
