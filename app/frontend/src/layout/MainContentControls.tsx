import { FunctionalComponent, h } from "preact"
import type { Dispatch } from "redux"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { TimeSlider } from "../time_control/TimeSlider"
import { ACTIONS } from "../state/actions"
import type { TimeSliderEvent } from "../time_control/interfaces"



interface OwnProps {
    // earliest_ms: number
    // latest_ms: number
    events: TimeSliderEvent[]
    data_set_name: string
}


const map_state = (state: RootState) => {
    return {
        reverse_order: state.routing.args.order === "reverse",
        rotation: state.routing.args.rotation,
    }
}


function map_dispatch (dispatch: Dispatch)
{
    return {
        change_reverse_order: (reverse: boolean) =>
        {
            const order = reverse ? "reverse" : "normal"
            dispatch(ACTIONS.routing.change_route({ args: { order } }))
        },
        change_rotation: (e: h.JSX.TargetedEvent<HTMLInputElement, Event>) =>
        {
            const rotation = e.currentTarget.value
            dispatch(ACTIONS.routing.change_route({ args: { rotation } }))
        },
    }
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _MainContentControls (props: Props)
{
    return <div>
        <TimeSlider
            events={props.events}
            data_set_name={props.data_set_name}
        />
        Reverse order <input
            type="checkbox"
            checked={props.reverse_order}
            onChange={e => props.change_reverse_order(e.currentTarget.checked)}
        ></input>
        Angle <input
            type="range"
            value={props.rotation}
            onChange={e => props.change_rotation(e)}
            min="-180"
            max="180"
            step="10"
            list="tickmarks_rotation"
            style={{ width: 300 }}
        ></input>
        <datalist id="tickmarks_rotation">
            {Array.from(Array(5)).map((_, i) => <option value={(i*90)-180}></option>)}
        </datalist>
    </div>
}


export const MainContentControls = connector(_MainContentControls) as FunctionalComponent<OwnProps>
