import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import { EditableCheckbox } from "../form/EditableCheckbox"
import { PlainShortcutKeys } from "../help_menu/ShortcutCommand"
import { shortcuts_map } from "../help_menu/shortcuts"
import { ACTIONS } from "../state/actions"
import type { CertaintyFormattingTypes, ValidityFilterTypes } from "../state/display_options/state"
import type { RootState } from "../state/State"
import { ExperimentalFeatures } from "./ExperimentalFeatures"
import { TimeResolutionOptions } from "./TimeResolutionOptions"



const map_state = (state: RootState) => ({
    validity_filter: state.display_options.validity_filter,
    certainty_formatting: state.display_options.certainty_formatting,
    display_by_simulated_time: state.display_options.display_by_simulated_time,
    focused_mode: state.display_options.focused_mode,
    circular_links: state.display_options.circular_links,
    display_time_marks: state.display_options.display_time_marks,
    animate_connections: state.display_options.animate_connections,
    show_large_grid: state.display_options.show_large_grid,
    display_time_sliders: state.controls.display_time_sliders,
})


const map_dispatch = {
    set_validity_filter: ACTIONS.display.set_validity_filter,
    set_certainty_formatting: ACTIONS.display.set_certainty_formatting,
    set_display_by_simulated_time: ACTIONS.display.set_display_by_simulated_time,
    set_or_toggle_focused_mode: ACTIONS.display.set_or_toggle_focused_mode,
    set_or_toggle_circular_links: ACTIONS.display.set_or_toggle_circular_links,
    set_display_time_marks: ACTIONS.display.set_display_time_marks,
    set_or_toggle_animate_connections: ACTIONS.display.set_or_toggle_animate_connections,
    set_or_toggle_show_large_grid: ACTIONS.display.set_or_toggle_show_large_grid,
    set_display_time_sliders: ACTIONS.controls.set_display_time_sliders,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _DisplayOptionsSidePanel (props: Props)
{
    const validity_filter_description = validity_filter_descriptions[props.validity_filter]

    return <div className="side_panel">
        <p className="section">
            <b>Validity filter</b>

            <br />

            <div style={{ display: "inline-flex" }}>
                Show: &nbsp; <AutocompleteText
                    placeholder=""
                    options={validity_filter_display_options}
                    selected_option_id={props.validity_filter}
                    allow_none={false}
                    on_change={validity_filter =>
                    {
                        if (!validity_filter) return
                        props.set_validity_filter({ validity_filter })
                    }}
                    editing_allowed={true}
                />
            </div>

            <br />

            <div className="description">
                {validity_filter_description.pre}<br/><i>
                certainty {validity_filter_description.condition}</i> {description_of_certainty}.
            </div>
        </p>



        <p className="section">
            <b>Validity formatting</b>

            <br />

            <div style={{ display: "inline-flex" }}>
                Opacity: &nbsp; <AutocompleteText
                    placeholder=""
                    options={certainty_formatting_display_options}
                    selected_option_id={props.certainty_formatting}
                    allow_none={false}
                    on_change={certainty_formatting =>
                    {
                        if (!certainty_formatting) return

                        props.set_certainty_formatting({ certainty_formatting })
                    }}
                    editing_allowed={true}
                />
            </div>

            <br />

            <div className="description">
                Show nodes and connection opacity as <i>
                {certainty_formatting_descriptions[props.certainty_formatting]}</i> {description_of_certainty}.
            </div>
        </p>



        <p className="section">
            <b>Time resolution</b> &nbsp;

            <TimeResolutionOptions />
        </p>



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
            <b>Show time markers</b>

            <EditableCheckbox
                value={props.display_time_marks}
                on_change={props.set_display_time_marks}
            />
        </p>



        {/* <p className="section">
            <b>Display by simulated time</b>

            <EditableCheckbox
                value={props.display_by_simulated_time}
                on_change={props.set_display_by_simulated_time}
            />

            <br />
            <span style={{ backgroundColor: "pink" }}>
                Experimental view not optimised for data sets over a large period of time.  Probably want to use "Show time markers" above.
            </span>
        </p> */}


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



const description_of_certainty = "(certainty is the minimum of probability or confidence, e.g. something with 70% probability and 20% confidence is 20% certain)"



const validity_filter_display_options: { id: ValidityFilterTypes, title: string }[] = [
    { id: "only_certain_valid", title: "Only valid" },
    { id: "only_maybe_valid", title: "Only maybe Valid" },
    { id: "maybe_invalid", title: "Maybe Invalid" },
    { id: "show_invalid", title: "Invalid" },
]

const default_validity_pre_text = "Only show nodes and connections with validity"
const validity_filter_descriptions: { [type in ValidityFilterTypes]: { pre: string, condition: string } } = {
    only_certain_valid: { pre: default_validity_pre_text, condition: "100%"  },
    only_maybe_valid:   { pre: default_validity_pre_text, condition: "> 50%" },
    maybe_invalid:      { pre: default_validity_pre_text, condition: "> 0%"  },
    show_invalid:       { pre: "Show all nodes and connections i.e. with validity",   condition: ">= 0%" },
}



const certainty_formatting_display_options: { id: CertaintyFormattingTypes, title: string }[] = [
    { id: "render_certainty_as_opacity", title: "Use certainty" },
    { id: "render_certainty_as_easier_opacity", title: "Use certainty (opacity >= 50%)" },
    { id: "render_100_opacity", title: "Always 100%" },
]

const certainty_formatting_descriptions: { [type in CertaintyFormattingTypes]: string } = {
    render_certainty_as_opacity: "proportional to certainty",
    render_certainty_as_easier_opacity: "proportional to certainty but no lower than 50% (easier to see)",
    render_100_opacity: "always 100% (no transparency)",
}
