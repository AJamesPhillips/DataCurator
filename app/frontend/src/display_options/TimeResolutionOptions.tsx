import { Button, ButtonGroup } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { ACTIONS } from "../state/actions"
import { time_resolution_types } from "../state/display_options/state"
import type { RootState } from "../state/State"
import { invertDisabledAppearance } from "../ui_themes/invert_disabled"

interface OwnProps
{
    extra_styles?: h.JSX.CSSProperties
}

const map_state = (state: RootState) => ({
    time_resolution: state.display_options.time_resolution,
    display_by_simulated_time: state.display_options.display_by_simulated_time,
})

const map_dispatch = {
    set_time_resolution: ACTIONS.display.set_time_resolution,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps

function _TimeResolutionOptions (props: Props)
{
    const classes = invertDisabledAppearance();
    return (!props.display_by_simulated_time) &&
        <ButtonGroup
            disableElevation
            variant="contained"
            value={props.time_resolution}
        >
            {time_resolution_types.map(type => (
                <Button
                    value={type}
                    onClick={(e:any) => {
                        const time_resolution:any = e.currentTarget.value
                        time_resolution && props.set_time_resolution({ time_resolution })
                    }}
                    className={classes.inverse_disabled}
                    disabled={(props.time_resolution == type) ? true : false }
                >
                    {type}
                </Button>)
            )}
        </ButtonGroup>
}

export const TimeResolutionOptions = connector(_TimeResolutionOptions) as FunctionalComponent<OwnProps>
