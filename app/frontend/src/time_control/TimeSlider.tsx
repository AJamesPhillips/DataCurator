import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { EditableCustomDateTime } from "../form/EditableCustomDateTime"
import type { RootState } from "../state/State"
import { find_nearest_index_in_sorted_list } from "../utils/binary_search"
import type { TimeSliderEvent } from "./interfaces"
import { NowButton } from "./NowButton"
import { floor_mseconds_to_resolution } from "../shared/utils/datetime"
import { Box, ButtonGroup, IconButton, Slider } from "@material-ui/core"
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

interface OwnProps
{
    events: TimeSliderEvent[]
    get_handle_ms: (state: RootState) => number,
    change_handle_ms: (new_handle_ms: number) => void,
    data_set_name: string
    title: string
}

const map_state = (state: RootState, { get_handle_ms }: OwnProps) => ({
    handle_datetime_ms: get_handle_ms(state),
    time_resolution: state.display_options.time_resolution,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps

function _TimeSlider (props: Props)
{
    const event_start_datetimes_ms = props.events.map(event =>
    {
        let ms = event.datetime.getTime()
        ms = floor_mseconds_to_resolution(ms, props.time_resolution)
        return ms
    })

    const earliest_ms = event_start_datetimes_ms[0]
    const latest_ms = event_start_datetimes_ms[event_start_datetimes_ms.length - 1]
    const current_index = find_nearest_index_in_sorted_list(event_start_datetimes_ms, i => i, props.handle_datetime_ms)

    function changed_handle_position (e: h.JSX.TargetedEvent<HTMLInputElement, Event>)
    {
        console.log("ASLKDJLASKJDA")
        const new_handle_datetime_ms = parseInt(e.currentTarget.value)
        props.change_handle_ms(new_handle_datetime_ms)
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

            let new_datetime_ms = event_start_datetimes_ms[next_index]
            while (new_datetime_ms === props.handle_datetime_ms)
            {
                next_index += direction
                new_datetime_ms = event_start_datetimes_ms[next_index]
            }

            if (!new_datetime_ms) return

            props.change_handle_ms(new_datetime_ms)
        }
    }

    const valuetext = (value: number) => `${value}`
    return (
        <Box class="time_slider" title="{props.title}" my={2} px={5}>
            <Box class="slider_container"  display="flex">
                <ButtonGroup size="small">
                    <IconButton
                        onClick={move_to_event_datetime(-1)}
                        disabled={current_index.bounds === "n/a" || current_index.index <= 0}>
                        <NavigateBeforeIcon />
                    </IconButton>
                    <IconButton
                        onClick={move_to_event_datetime(1)}
                        disabled={current_index.bounds === "n/a" || current_index.index >= (event_start_datetimes_ms.length - 1)}>
                            <NavigateNextIcon />
                    </IconButton>
                </ButtonGroup>
                <Box flexGrow={1}>
                    <Slider
                        onChange={changed_handle_position}
                        color="secondary"
                        value={props.handle_datetime_ms}
                        getAriaValueText={valuetext}
                        step={1}
                        min={earliest_ms}
                        max={latest_ms}
                        valueLabelDisplay="auto"
                        marks={event_start_datetimes_ms.map(r => { return { value: r, label:'' } })}
                    />
                    {/* <br />
                    <input
                        type="range"
                        onChange={changed_handle_position}
                        value={props.handle_datetime_ms}
                        min={earliest_ms}
                        max={latest_ms}
                        list={"tickmarks_timeslider_" + props.data_set_name}
                    /> */}
                </Box>
            </Box>
            <datalist id={"tickmarks_timeslider_" + props.data_set_name}>
                {event_start_datetimes_ms.map(d => <option value={d}>{d}</option>)}
            </datalist>
            <Box display="flex" justifyContent="flex-end"alignItems="center">
                <EditableCustomDateTime
                    value={new Date(props.handle_datetime_ms)}
                    on_change={new_datetime => new_datetime && props.change_handle_ms(new_datetime.getTime())}
                    show_now_shortcut_button={false}
                    show_today_shortcut_button={false}
                    always_allow_editing={true}
                />
                <NowButton change_datetime_ms={datetime_ms => props.change_handle_ms(datetime_ms)} />
            </Box>
        </Box>
    )
}


export const TimeSlider = connector(_TimeSlider) as FunctionalComponent<OwnProps>
