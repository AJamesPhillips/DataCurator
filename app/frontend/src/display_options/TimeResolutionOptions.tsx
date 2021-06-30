import { Box } from "@material-ui/core"
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { ACTIONS } from "../state/actions"
import { time_resolution_types } from "../state/display_options/state"
import type { RootState } from "../state/State"


interface OwnProps
{
    extra_styles?: h.JSX.CSSProperties
}


const map_state = (state: RootState) => ({
    time_resolution: state.display_options.time_resolution,
})

const map_dispatch = {
    set_time_resolution: ACTIONS.display.set_time_resolution,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _TimeResolutionOptions (props: Props)
{
    return (
        <ToggleButtonGroup
            exclusive
            size="small"
            value={props.time_resolution}
            onChange={(e: any) => {
                const time_resolution:any = e.currentTarget.value
                time_resolution && props.set_time_resolution({ time_resolution })
            }}
            aria-label="text formatting">
                {time_resolution_types.map(type => (
                    <ToggleButton value={type}>
                        {type}
                    </ToggleButton>)
                )}

        </ToggleButtonGroup>
    )
}

export const TimeResolutionOptions = connector(_TimeResolutionOptions) as FunctionalComponent<OwnProps>
