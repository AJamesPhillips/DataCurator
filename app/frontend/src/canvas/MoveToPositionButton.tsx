import FilterCenterFocusIcon from "@mui/icons-material/FilterCenterFocus"
import { Box, IconButton } from "@mui/material"
import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import type { ViewType } from "../state/routing/interfaces"
import type { PositionAndZoom } from "./interfaces"



interface OwnProps
{
    description: string
    move_to_xy: PositionAndZoom | undefined
}

const map_dispatch = {
    move: (position: PositionAndZoom, view: ViewType) => ACTIONS.routing.change_route({
        args: { view, ...position },
    })
}
const connector = connect(null, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps

function _MoveToPositionButton (props: Props)
{
    const { move_to_xy: move_to_position } = props

    if (!move_to_position) return null

    return (
        <Box zIndex={10} m={2}>
            <IconButton
                size="small"
                onClick={() => props.move(move_to_position, "knowledge")}
                aria-label={props.description}
            >
                <FilterCenterFocusIcon />
            </IconButton>
        </Box>
    )
}

export const MoveToPositionButton = connector(_MoveToPositionButton) as FunctionalComponent<OwnProps>
