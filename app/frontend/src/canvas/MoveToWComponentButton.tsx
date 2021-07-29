import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import {
    get_current_composed_knowledge_view_from_state,
    get_wcomponent_from_state,
} from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { ACTIONS } from "../state/actions"
import FilterCenterFocusIcon from '@material-ui/icons/FilterCenterFocus'
import { lefttop_to_xy } from "../state/display_options/display"
import { Box, IconButton } from "@material-ui/core"
import type { PositionAndZoom } from "./interfaces"
import { get_created_at_ms } from "../shared/wcomponent/utils_datetime"



interface OwnProps
{
    wcomponent_id?: string
}

const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { wcomponent_id } = own_props
    let go_to_datetime_ms = state.routing.args.created_at_ms

    let position: PositionAndZoom | undefined = undefined

    if (wcomponent_id)
    {
        const wcomponent = get_wcomponent_from_state(state, wcomponent_id)

        if (wcomponent)
        {
            const wcomponent_created_at_ms = get_created_at_ms(wcomponent)
            go_to_datetime_ms = Math.max(go_to_datetime_ms, wcomponent_created_at_ms)
        }

        const current_composed_knowledge_view = get_current_composed_knowledge_view_from_state(state)
        const composed_knowledge_view_entry = current_composed_knowledge_view && current_composed_knowledge_view.composed_wc_id_map[wcomponent_id]
        if (composed_knowledge_view_entry)
        {
            position = {
                ...composed_knowledge_view_entry,
                zoom: 100,
            }
        }
    }

    return {
        go_to_datetime_ms,
        position: lefttop_to_xy(position, true)
    }
}

const map_dispatch = {
    move: (position: PositionAndZoom, datetime_ms: number) => ACTIONS.routing.change_route({
        args: {
            created_at_ms: datetime_ms,
            ...position
        },
    })
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps

function _MoveToWComponentButton (props: Props)
{
    const { wcomponent_id, position, go_to_datetime_ms  } = props

    if (!wcomponent_id || !position) return

    return (
        <Box zIndex={10} m={2}>
            <IconButton size="small" onClick={() => props.move(position, go_to_datetime_ms)}>
                <FilterCenterFocusIcon />
            </IconButton>
        </Box>
    )
}
export const MoveToWComponentButton = connector(_MoveToWComponentButton) as FunctionalComponent<OwnProps>