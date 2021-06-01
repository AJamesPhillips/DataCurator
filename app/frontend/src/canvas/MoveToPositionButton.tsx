import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import { calculate_xy_for_put_middle } from "../state/display_options/display"
import type { Position } from "./interfaces"



interface PositionAndZoom extends Partial<Position>
{
    zoom?: number
}


interface OwnProps
{
    description: string
    move_to_xy: PositionAndZoom | undefined
}

const map_dispatch = {
    move: (position: PositionAndZoom) => ACTIONS.routing.change_route({ args: position })
}
const connector = connect(null, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps

function _MoveToPositionButton (props: Props)
{
    const { move_to_xy: move_to_position } = props

    if (!move_to_position) return null

    return <input
        type="button"
        value={props.description}
        onClick={() => props.move(move_to_position)}
    ></input>
}

export const MoveToPositionButton = connector(_MoveToPositionButton) as FunctionalComponent<OwnProps>



export function lefttop_to_xy (position?: { left?: number, top?: number, zoom?: number}, middle?: boolean): PositionAndZoom | undefined
{
    if (!position) return undefined

    const { left: x, top, zoom } = position
    const y = top !== undefined ? -1 * top : undefined

    if (middle && x !== undefined && y  !== undefined && zoom !== undefined)
    {
        const middle = calculate_xy_for_put_middle({ x, y, zoom })
        return { ...middle, zoom }
    }

    return { x, y, zoom }
}
