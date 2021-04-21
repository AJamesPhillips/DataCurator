import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { x } from "../canvas/display"



interface OwnProps
{
    max_y: number
    display_last_n_months?: number
}


const map_state = (state: RootState) =>
{
    return {
        current_datetime: state.current_datetime.dt
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _CurrentDatetimeLine (props: Props)
{
    const {
        max_y,
        display_last_n_months = 5,
        current_datetime,
    } = props
    const x_val = x(current_datetime.getTime())

    const previous_month_lines: h.JSX.Element[] = []
    if (display_last_n_months)
    {
        const days_in_month = 30.44
        const ms_seconds_in_day = 86400000
        const x_val_month = x(ms_seconds_in_day * days_in_month)


        Array.from(Array(display_last_n_months)).forEach((_, i) =>
        {
            const x_offset = (i + 1) * x_val_month
            const ratio = (display_last_n_months - i) / display_last_n_months
            const opacity = 0.2 + (0.8 * ratio)

            previous_month_lines.push(<line
                x1={x_val - x_offset}
                y1="0"
                x2={x_val - x_offset}
                y2={max_y}
                stroke={`rgba(190,190,210,${opacity})`}
                strokeWidth="2"
            />)
        })
    }

    return <g>
        {...previous_month_lines}
        <line
            x1={x_val}
            y1="0"
            x2={x_val}
            y2={props.max_y}
            stroke="red"
            strokeWidth="2"
        />
    </g>
}
export const CurrentDatetimeLine = connector(_CurrentDatetimeLine) as FunctionalComponent<OwnProps>
