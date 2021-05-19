import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../state/State"
import { TimeSlider } from "../time_control/TimeSlider"



const map_state = (state: RootState) => ({
    events: [],
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>


function _ObjectivesContentControls (props: Props)
{
    return <TimeSlider
        events={props.events}
        data_set_name="objectives"
    />
}

export const ObjectivesContentControls = connector(_ObjectivesContentControls) as FunctionalComponent<{}>
