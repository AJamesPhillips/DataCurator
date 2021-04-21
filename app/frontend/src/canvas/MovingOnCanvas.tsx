// import { ComponentChildren, FunctionalComponent, h } from "preact"
// import { connect, ConnectedProps } from "react-redux"

// import type { Position } from "./interfaces"
// import type { RootState } from "../state/State"
// import { round_coordinate20 } from "../state/display/display"
// import { calculate_xy_from_client_xy } from "./position_utils"



// interface OwnProps
// {
//     pointer_id: number | undefined
//     set_tmp_position: (position: Position) => void
//     update_position: () => void
//     children: ComponentChildren
// }



// const map_state = (state: RootState, props: OwnProps) =>
// {
//     return {
//         x: state.routing.args.x,
//         y: state.routing.args.y,
//         zoom: state.routing.args.zoom,
//         canvas_bounding_rect: state.display.canvas_bounding_rect,
//     }
// }


// const connector = connect(map_state)
// type Props = ConnectedProps<typeof connector> & OwnProps


// function _MovingOnCanvas (props: Props)
// {
//     const { canvas_bounding_rect } = props

//     if (!canvas_bounding_rect)
//     {
//         console.error("Can not calculate move coordinates if canvas_bounding_rect is unknown")
//         return props.children
//     }


//     const on_pointer_move = (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) =>
//     {
//         e.currentTarget.innerHTML = `${e.clientX}, ${e.clientY}`
//         console. log("Moving on_pointer_move", e.clientX)
//         // const position = calculate_xy_from_client_xy({
//         //     client_x: e.clientX,
//         //     client_y: e.clientY,
//         //     canvas_bounding_rect,
//         //     x: props.x,
//         //     y: props.y,
//         //     zoom: props.zoom,
//         // })
//         // const snapped_position = calc_snapped_position(position)
//         // props.set_tmp_position(snapped_position)
//     }


//     return <div id="thing"
//         onPointerMove={on_pointer_move}
//         // onPointerMoveCapture={() => console. log("pointer move capture")}
//         onPointerDown={props.update_position}
//         style={{ width: 200, height: 200, backgroundColor: "blue" }}
//         ref={r =>
//         {
//             if (!r || props.pointer_id === undefined) return
//             r.setPointerCapture(props.pointer_id) // does not seem to work, events from the graph_container are not sent here.
//         }}
//     >
//         {props.children}
//     </div>
// }

// export const MovingOnCanvas = connector(_MovingOnCanvas) as FunctionalComponent<OwnProps>



// function calc_snapped_position (position: Position): Position
// {
//     const indent = 120

//     return { x: round_coordinate20(position.x - 50), y: round_coordinate20(-position.y + 250) }
// }
