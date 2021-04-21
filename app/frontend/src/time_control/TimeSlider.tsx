import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { useState } from "preact/hooks"

import "./time_slider.css"
import { date2str_auto } from "../shared/utils/date_helpers"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { created_at_datetime_ms_to_routing_args, routing_args_to_datetime_ms } from "../state/routing/routing_datetime"
import type { TimeSliderData } from "./interfaces"
import { find_nearest_index_in_sorted_list } from "../utils/binary_search"



interface OwnProps extends TimeSliderData
{
    data_set_name: string
}


function map_state (state: RootState)
{
    return {
        datetime_ms: routing_args_to_datetime_ms(state),
    }
}


const map_dispatch = {
    change_route: ACTIONS.routing.change_route
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


const MSECONDS_PER_DAY = 86400000
function _TimeSlider (props: Props)
{
    const unique_event_start_datetimes_ms = new Set(props.events
        .map(event => event.start_date.getTime()))

    const event_start_datetimes_ms = [...unique_event_start_datetimes_ms]
        .sort((a, b) => a < b ? -1 : (a > b ? 1 : 0))

    const earliest_ms = event_start_datetimes_ms[0]
    const latest_ms = event_start_datetimes_ms[event_start_datetimes_ms.length - 1]

    const [handle_position_ms, set_handle_position_ms] = useState(props.datetime_ms)
    const current_index = find_nearest_index_in_sorted_list(event_start_datetimes_ms, i => i, handle_position_ms)


    function change_datetime_ms (new_datetime_ms: number, update_route: boolean)
    {
        set_handle_position_ms(new_datetime_ms)

        if (update_route)
        {
            const args = created_at_datetime_ms_to_routing_args(new_datetime_ms)
            props.change_route({ route: undefined, sub_route: undefined, item_id: undefined, args })
        }
    }


    function changed_handle_position (e: h.JSX.TargetedEvent<HTMLInputElement, Event>, update_route: boolean)
    {
        const new_handle_position_ms = parseInt(e.currentTarget.value)
        change_datetime_ms(new_handle_position_ms, update_route)
    }


    function move_to_event_datetime (direction: 1 | -1)
    {
        return () => {
            let next_index = current_index.index + direction

            if (!current_index.exact)
            {
                if (direction === 1) next_index = Math.ceil(current_index.index)
                else next_index = Math.floor(current_index.index)
            }

            const new_datetime_ms = event_start_datetimes_ms[next_index]

            change_datetime_ms(new_datetime_ms, true)
        }
    }


    return <div className="time_slider">
        <div className="slider_container">
            <input
                type="button"
                value="<"
                disabled={current_index.bounds === "n/a" || current_index.index <= 0}
                onClick={move_to_event_datetime(-1)}
            ></input>
            <input
                type="button"
                value=">"
                disabled={current_index.bounds === "n/a" || current_index.index >= (event_start_datetimes_ms.length - 1)}
                onClick={move_to_event_datetime(1)}
            ></input>
            <input
                type="range"
                onChange={e => changed_handle_position(e, true)} // change to false for performance
                onMouseUp={e => changed_handle_position(e, true)}
                value={handle_position_ms}
                min={earliest_ms}
                max={latest_ms}
                list={"tickmarks_timeslider_" + props.data_set_name}
            ></input>
        </div>
        <br />

        <datalist id={"tickmarks_timeslider_" + props.data_set_name}>
            {event_start_datetimes_ms.map(d => <option value={d}>{d}</option>)}
        </datalist>

        {date2str_auto(new Date(handle_position_ms))}

    </div>
}


export const TimeSlider = connector(_TimeSlider) as FunctionalComponent<OwnProps>
