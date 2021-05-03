import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { useState } from "preact/hooks"

import "./time_slider.css"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
// import { created_at_datetime_ms_to_routing_args } from "../state/routing/routing_datetime"
import { find_nearest_index_in_sorted_list } from "../utils/binary_search"
import type { TimeSliderEvent } from "./interfaces"
import { EditableCustomDateTime } from "../form/EditableCustomDateTime"
import { NowButton } from "./NowButton"



interface OwnProps
{
    events: TimeSliderEvent[]
    data_set_name: string
}


function map_state (state: RootState)
{
    return {
        created_at_ms: state.routing.args.created_at_ms,
    }
}


const map_dispatch = {
    change_display_at_sim_datetime: ACTIONS.display_at_sim_datetime.change_display_at_sim_datetime
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


const MSECONDS_PER_DAY = 86400000
function _TimeSliderV2 (props: Props)
{
    const event_start_datetimes_ms = props.events.map(event => event.datetime.getTime())

    const earliest_ms = event_start_datetimes_ms[0]
    const latest_ms = event_start_datetimes_ms[event_start_datetimes_ms.length - 1]

    const [handle_position_ms, set_handle_position_ms] = useState(props.created_at_ms)
    const current_index = find_nearest_index_in_sorted_list(event_start_datetimes_ms, i => i, handle_position_ms)


    function change_datetime_ms (new_datetime_ms: number, update_route: boolean)
    {
        set_handle_position_ms(new_datetime_ms)

        if (update_route)
        {
            props.change_display_at_sim_datetime({ ms: new_datetime_ms })
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
            if (!new_datetime_ms) return

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
            />
            <input
                type="button"
                value=">"
                disabled={current_index.bounds === "n/a" || current_index.index >= (event_start_datetimes_ms.length - 1)}
                onClick={move_to_event_datetime(1)}
            />
            <input
                type="range"
                onChange={e => changed_handle_position(e, true)} // change to false for performance
                onMouseUp={e => changed_handle_position(e, true)}
                value={handle_position_ms}
                min={earliest_ms}
                max={latest_ms}
                list={"tickmarks_timeslider_" + props.data_set_name}
            />
        </div>
        <br />

        <datalist id={"tickmarks_timeslider_" + props.data_set_name}>
            {event_start_datetimes_ms.map(d => <option value={d}>{d}</option>)}
        </datalist>

        <div style={{ maxWidth: 200, display: "inline-flex", float: "right" }}>
            <EditableCustomDateTime
                invariant_value={undefined}
                value={new Date(handle_position_ms)}
                on_change={new_datetime => new_datetime && change_datetime_ms(new_datetime.getTime(), true)}
                show_now_shortcut_button={false}
                show_today_shortcut_button={false}
            />
            <NowButton change_datetime_ms={datetime_ms => change_datetime_ms(datetime_ms, true)} />
        </div>

    </div>
}

export const TimeSliderV2 = connector(_TimeSliderV2) as FunctionalComponent<OwnProps>
