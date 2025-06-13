import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { EditableCheckbox } from "../form/EditableCheckbox"
import { PlainShortcutKeys } from "../help_menu/ShortcutCommand"
import { shortcuts_map } from "../help_menu/shortcuts"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { ExperimentalFeatures } from "./ExperimentalFeatures"



const map_state = (state: RootState) => ({
    focused_mode: state.display_options.focused_mode,
    circular_links: state.display_options.circular_links,
    animate_connections: state.display_options.animate_connections,
    show_large_grid: state.display_options.show_large_grid,
    display_time_sliders: state.controls.display_time_sliders,
})


const map_dispatch = {
    set_or_toggle_focused_mode: ACTIONS.display.set_or_toggle_focused_mode,
    set_or_toggle_circular_links: ACTIONS.display.set_or_toggle_circular_links,
    set_or_toggle_animate_connections: ACTIONS.display.set_or_toggle_animate_connections,
    set_or_toggle_show_large_grid: ACTIONS.display.set_or_toggle_show_large_grid,
    set_display_time_sliders: ACTIONS.controls.set_display_time_sliders,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _DisplayOptionsSidePanel (props: Props)
{
    return <div className="side_panel">

        <p className="section">
            <b>Use "Focused" Mode</b>
            &nbsp; <PlainShortcutKeys {...shortcuts_map.toggle_focused} />

            <EditableCheckbox
                value={props.focused_mode}
                on_change={props.set_or_toggle_focused_mode}
            />
        </p>



        <p className="section">
            <b>Show connections as more circular</b>
            &nbsp; <PlainShortcutKeys {...shortcuts_map.toggle_circular_connections} />

            <EditableCheckbox
                value={props.circular_links}
                on_change={props.set_or_toggle_circular_links}
            />
        </p>



        <p className="section">
            <b>Animate connections</b>
            &nbsp; <PlainShortcutKeys {...shortcuts_map.toggle_animating} />

            <EditableCheckbox
                value={props.animate_connections}
                on_change={props.set_or_toggle_animate_connections}
            />
        </p>


        <p className="section">
            <b>Show large grid (whilst editing)</b>

            <EditableCheckbox
                value={props.show_large_grid}
                on_change={props.set_or_toggle_show_large_grid}
            />
        </p>


        <hr />

        <ExperimentalFeatures />

        <hr />

        <h3>Controls</h3>


        <p className="section">
            <b>Display time sliders for "created at" and "simulated" time</b>
            &nbsp; <PlainShortcutKeys {...shortcuts_map.toggle_time} />

            <EditableCheckbox
                value={props.display_time_sliders}
                on_change={display_time_sliders =>
                {
                    props.set_display_time_sliders(display_time_sliders)
                }}
            />
        </p>
    </div>
}

export const DisplayOptionsSidePanel = connector(_DisplayOptionsSidePanel) as FunctionalComponent
