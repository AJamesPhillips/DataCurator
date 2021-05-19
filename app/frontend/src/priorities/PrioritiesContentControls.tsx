import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../state/State"
import { TimeSlider } from "../time_control/TimeSlider"



const map_state = (state: RootState) => ({
    events: state.derived.project_priorities_meta.project_priority_events,
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
    </div>
}

export const PrioritiesContentControls = connector(_PrioritiesContentControls) as FunctionalComponent<{}>
