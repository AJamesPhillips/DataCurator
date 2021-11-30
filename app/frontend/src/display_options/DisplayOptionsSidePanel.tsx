import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import { ACTIONS } from "../state/actions"
import type { ValidityFilterTypes, CertaintyFormattingTypes } from "../state/display_options/state"
import type { RootState } from "../state/State"
import { TimeResolutionOptions } from "./TimeResolutionOptions"
import { EditableCheckbox } from "../form/EditableCheckbox"



const map_state = (state: RootState) => ({
    validity_filter: state.display_options.validity_filter,
    certainty_formatting: state.display_options.certainty_formatting,
    display_by_simulated_time: state.display_options.display_by_simulated_time,
    focused_mode: state.display_options.focused_mode,
    circular_links: state.display_options.circular_links,
    display_time_marks: state.display_options.display_time_marks,
    animate_causal_links: state.display_options.animate_causal_links,
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
    set_or_toggle_animate_causal_links: ACTIONS.display.set_or_toggle_animate_causal_links,
    set_or_toggle_show_large_grid: ACTIONS.display.set_or_toggle_show_large_grid,
    set_display_time_sliders: ACTIONS.controls.set_display_time_sliders,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _DisplayOptionsSidePanel (props: Props)
{

    return <div className="side_panel">
        <h3>Display Options</h3>


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
                    force_editable={true}
                />
            </div>

            <br />

            <div className="description">
                Show only nodes and connections with validity <br/><i>
                certainty {validity_filter_descriptions[props.validity_filter]}</i> {description_of_certainty}.
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
                    force_editable={true}
                />
            </div>

            <br />

            <div className="description">
                Show nodes and connection opacity as <i>
                {certainty_formatting_descriptions[props.certainty_formatting]}</i> {description_of_certainty}.
            </div>
        </p>



        <p className="section">
            <b>Time resolution</b>

            <TimeResolutionOptions />
        </p>



        <p className="section">
            <b>Use "Focused" Mode</b>
            &nbsp; <span className="description">ctrl + d + f</span>

            <EditableCheckbox
                value={props.focused_mode}
                on_change={props.set_or_toggle_focused_mode}
            />
        </p>



        <p className="section">
            <b>Show causal links as more circular</b>
            &nbsp; <span className="description">ctrl + d + c</span>

            <EditableCheckbox
                value={props.circular_links}
                on_change={props.set_or_toggle_circular_links}
            />
        </p>



        <p className="section">
            <b>Animate causal connections</b>
            &nbsp; <span className="description">ctrl + d + a</span>

            <EditableCheckbox
                value={props.animate_causal_links}
                on_change={props.set_or_toggle_animate_causal_links}
            />
        </p>



        <p className="section">
            <b>Show time markers</b>

            <EditableCheckbox
                value={props.display_time_marks}
                on_change={props.set_display_time_marks}
            />
        </p>



        <p className="section">
            <b>Display by simulated time</b>

            <EditableCheckbox
                value={props.display_by_simulated_time}
                on_change={props.set_display_by_simulated_time}
            />

            <br />
            <span style={{ backgroundColor: "pink" }}>
                Experimental view not optimised for data sets over a large period of time.  Probably want to use "Show time markers" above.
            </span>
        </p>


        <p className="section">
            <b>Show large grid (whilst editing)</b>

            <EditableCheckbox
                value={props.show_large_grid}
                on_change={props.set_or_toggle_show_large_grid}
            />
        </p>


        <hr />

        <h3>Controls</h3>


        <p className="section">
            <b>Whilst presenting, display time sliders for "created at" and "simulated" time</b>

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

export const DisplayOptionsSidePanel = connector(_DisplayOptionsSidePanel) as FunctionalComponent<{}>



const description_of_certainty = "(certainty is the minimum of probability or confidence, e.g. something with 70% probability and 20% confidence is 20% certain)"



const validity_filter_display_options: { id: ValidityFilterTypes, title: string }[] = [
    { id: "only_certain_valid", title: "Only valid" },
    { id: "only_maybe_valid", title: "Only maybe Valid" },
    { id: "maybe_invalid", title: "Maybe Invalid" },
    { id: "show_invalid", title: "Invalid" },
]

const validity_filter_descriptions: { [type in ValidityFilterTypes]: string } = {
    only_certain_valid: "100%",
    only_maybe_valid: "> 50%",
    maybe_invalid: "> 0%",
    show_invalid: ">= 0%",
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
