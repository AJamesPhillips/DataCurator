import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import type { PositionAndZoom } from "./interfaces"



interface OwnProps
{
    description: string
    move_to_xy: PositionAndZoom | undefined
}

const map_dispatch = {
    move: (position: PositionAndZoom) => ACTIONS.routing.change_route({ args: { view: "knowledge", ...position } })
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
