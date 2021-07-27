import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { get_current_composed_knowledge_view_from_state, get_wcomponent_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { ACTIONS } from "../state/actions"
import FilterCenterFocusIcon from '@material-ui/icons/FilterCenterFocus'
import { lefttop_to_xy } from "../state/display_options/display"
import { Box, IconButton } from "@material-ui/core"

interface OwnProps
{
    wcomponent_id:string | null
}
const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { wcomponent_id } = own_props
    const wcomponent = get_wcomponent_from_state(state, wcomponent_id)

    const current_composed_knowledge_view = get_current_composed_knowledge_view_from_state(state)
    const composed_knowledge_view_entry = current_composed_knowledge_view && current_composed_knowledge_view.composed_wc_id_map[wcomponent_id]

    const position = {
        zoom:state.routing.args.zoom,
        ...composed_knowledge_view_entry
    }

    const canvas_date:Date = state.routing.args.created_at_datetime
    let go_to_date:Date = canvas_date
    if (wcomponent && canvas_date < wcomponent.created_at) {
        go_to_date = wcomponent.created_at
    }
    return {
        date_time: go_to_date,
        position: lefttop_to_xy(position, true)
    }
}

const map_dispatch = {
    move: (position:any, date_time:any) => {
        return ACTIONS.routing.change_route({
            args: {
                created_at_datetime:date_time,
                created_at_ms:date_time.getTime(),
                ...position
            },
        })
    }
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps

function _MoveToWComponentButton (props: Props)
{
   const { wcomponent_id, position, date_time  } = props
    if (!wcomponent_id) return

    return (
        <Box zIndex={10} m={2}>
            <IconButton size="small" onClick={() => props.move(position, date_time)}>
                <FilterCenterFocusIcon />
            </IconButton>
        </Box>
    )
}
export const MoveToWComponentButton = connector(_MoveToWComponentButton) as FunctionalComponent<OwnProps>