import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../form/AutocompleteText"
import { ACTIONS } from "../state/actions"
import type { ValidityFilterTypes } from "../state/display_options/state"
import type { RootState } from "../state/State"
import { TimeResolutionOptions } from "./TimeResolutionOptions"



const map_state = (state: RootState) => ({
    validity_filter: state.display_options.validity_filter,
})


const map_dispatch = {
    set_validity_filter: ACTIONS.display.set_validity_filter,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _DisplayOptionsSidePanel (props: Props)
{

    return <div>
        <h3>Display Options</h3>

        <p>
            <b>Validity</b>

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

            Show only nodes and connections with validity <i style={{ whiteSpace: "nowrap" }}>
            certainty {validity_filter_descriptions[props.validity_filter]}</i> (certainty is the minimum of probability or confidence, e.g. something with 70% probability and 20% confidence is 20% certain).
        </p>

        <p>
            <b>Time resolution</b>

            <TimeResolutionOptions />
        </p>
    </div>
}

export const DisplayOptionsSidePanel = connector(_DisplayOptionsSidePanel) as FunctionalComponent<{}>



const validity_filter_display_options: { id: ValidityFilterTypes, title: string }[] = [
    { id: "only_certain_valid", title: "Valid" },
    { id: "only_maybe_valid", title: "Maybe Valid" },
    { id: "maybe_invalid", title: "Maybe Invalid" },
    { id: "show_invalid", title: "Invalid" },
]

const validity_filter_descriptions: { [type in ValidityFilterTypes]: string } = {
    only_certain_valid: "100%",
    only_maybe_valid: "> 50%",
    maybe_invalid: "> 0%",
    show_invalid: ">= 0%",
}
