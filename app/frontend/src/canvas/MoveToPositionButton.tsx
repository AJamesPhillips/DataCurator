import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import type { ViewType } from "../state/routing/interfaces"
import type { RootState } from "../state/State"
import type { PositionAndZoom } from "./interfaces"



interface OwnProps
{
    description: string
    move_to_xy: PositionAndZoom | undefined
}

const map_state = (state: RootState) => ({
    view: state.routing.args.view,
})

const map_dispatch = {
    move: (position: PositionAndZoom, view: ViewType) => ACTIONS.routing.change_route({
        args: { view, ...position },
    })
}
const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps

function _MoveToPositionButton (props: Props)
{
    const { move_to_xy: move_to_position } = props

    if (!move_to_position) return null

    const view_types_to_maintain: Set<ViewType> = new Set(["knowledge", "priorities"])
    const view: ViewType = view_types_to_maintain.has(props.view) ? props.view : "knowledge"

    return <input
        type="button"
        value={props.description}
        onClick={() => props.move(move_to_position, view)}
    ></input>
}

export const MoveToPositionButton = connector(_MoveToPositionButton) as FunctionalComponent<OwnProps>
