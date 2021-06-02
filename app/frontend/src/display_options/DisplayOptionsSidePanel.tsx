import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./DisplayOptionsSidePanel.css"
import { AutocompleteText } from "../form/AutocompleteText"
import { ACTIONS } from "../state/actions"
import type { ValidityFilterTypes, ValidityFormattingTypes } from "../state/display_options/state"
import type { RootState } from "../state/State"
import { TimeResolutionOptions } from "./TimeResolutionOptions"



const map_state = (state: RootState) => ({
    validity_filter: state.display_options.validity_filter,
    validity_formatting: state.display_options.validity_formatting,
})


const map_dispatch = {
    set_validity_filter: ACTIONS.display.set_validity_filter,
    set_validity_formatting: ACTIONS.display.set_validity_formatting,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _DisplayOptionsSidePanel (props: Props)
{

    return <div className="display_options_side_panel">
        <h3>Display Options</h3>



        <p className="section">
            <b>Validity filter</b>

            <br />

            <div style={{ display: "inline-flex" }}>
                Show: <AutocompleteText
                    placeholder=""
                    options={validity_filter_display_options}
                    selected_option_id={props.validity_filter}
                    allow_none={false}
                    on_change={validity_filter =>
                    {
                        if (!validity_filter) return

                        props.set_validity_filter({ validity_filter })
                    }}
                />
            </div>

            <br />

            <div className="description">
                Show only nodes and connections with validity <i>
                certainty {validity_filter_descriptions[props.validity_filter]}</i> {description_of_certainty}.
            </div>
        </p>



        <p className="section">
            <b>Validity formatting</b>

            <br />

            <div style={{ display: "inline-flex" }}>
                Opacity: <AutocompleteText
                    placeholder=""
                    options={validity_formatting_display_options}
                    selected_option_id={props.validity_formatting}
                    allow_none={false}
                    on_change={validity_formatting =>
                    {
                        if (!validity_formatting) return

                        props.set_validity_formatting({ validity_formatting })
                    }}
                />
            </div>

            <br />

            <div className="description">
                Show nodes and connection opacity as <i>
                {validity_formatting_descriptions[props.validity_formatting]}</i> {description_of_certainty}.
            </div>
        </p>



        <p className="section">
            <b>Time resolution</b>

            <TimeResolutionOptions />
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



const validity_formatting_display_options: { id: ValidityFormattingTypes, title: string }[] = [
    { id: "render_certainty_as_opacity", title: "Use certainty" },
    { id: "render_100_opacity", title: "Always 100%" },
]

const validity_formatting_descriptions: { [type in ValidityFormattingTypes]: string } = {
    render_certainty_as_opacity: "proportional to certainty",
    render_100_opacity: "always 100% (no transparency)",
}
