import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../state/State"
import { TimeSlider } from "../time_control/TimeSlider"
import { DailyActionsList } from "./daily_actions/DailyActionsList"



const map_state = (state: RootState) => ({
    events: [], // project_priority_events,
    // action_ids_to_show: [], //state.action_ids_to_show,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>


function _PrioritiesContentControls (props: Props)
{

    return <div>
        <TimeSlider
            events={props.events}
            data_set_name="priorities"
        />
        <datalist id="tickmarks_rotation">
            {Array.from(Array(5)).map((_, i) => <option value={(i*90)-180}></option>)}
        </datalist>

        {/* {props.action_ids_to_show.length > 0 && <DailyActionsList
            action_ids_to_show={state.action_ids_to_show}
            on_close={() => set_state({ action_ids_to_show: [] })}
        />} */}
    </div>
}

export const PrioritiesContentControls = connector(_PrioritiesContentControls) as FunctionalComponent<{}>
