import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../form/AutocompleteText"
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
    return <AutocompleteText
        placeholder="Time resolution..."
        selected_option_id={props.time_resolution}
        options={time_resolution_types.map(type => ({ id: type, title: type }))}
        allow_none={false}
        on_change={time_resolution => time_resolution && props.set_time_resolution({ time_resolution })}
        extra_styles={props.extra_styles}
    />
}

export const TimeResolutionOptions = connector(_TimeResolutionOptions) as FunctionalComponent<OwnProps>
