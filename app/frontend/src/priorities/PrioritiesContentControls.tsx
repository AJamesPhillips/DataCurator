import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import type { PositionAndZoom } from "../canvas/interfaces"

import { MoveToItemButton } from "../canvas/MoveToWComponentButton"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { TimeSlider } from "../time_control/TimeSlider"



const map_state = (state: RootState) => ({
    events: [] //state.derived.project_priorities_meta.project_priority_events,
})

const map_dispatch = {
    change_display_at_created_datetime: ACTIONS.display_at_created_datetime.change_display_at_created_datetime,
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>


function _PrioritiesContentControls (props: Props)
{
    const [allow_drawing_attention, set_allow_drawing_attention] = useState(true)

    const position: PositionAndZoom = { x: 0, y: 0, zoom: 100 }
    const components_on_screen = true
    const draw_attention = allow_drawing_attention && position && !components_on_screen


    return <div>
        <MoveToItemButton
            move={() => props.change_route({ args: position })}
            draw_attention={draw_attention}
            have_finished_drawing_attention={() => set_allow_drawing_attention(false)}
        />
        <TimeSlider
            title="Created at datetimes"
            get_handle_ms={state => state.routing.args.created_at_ms}
            change_handle_ms={ms => props.change_display_at_created_datetime({ ms })}
            events={props.events}
            data_set_name="priorities"
        />
    </div>
}

export const PrioritiesContentControls = connector(_PrioritiesContentControls) as FunctionalComponent<{}>
