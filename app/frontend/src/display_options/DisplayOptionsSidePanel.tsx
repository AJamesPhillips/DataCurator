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

            <AutocompleteText
                placeholder=""
                options={validity_display_options}
                selected_option_id={props.validity_filter}
                allow_none={false}
                on_change={validity_filter =>
                {
                    if (!validity_filter) return

                    props.set_validity_filter({ validity_filter })
                }}
            />
        </p>

        <p>
            <b>Time resolution</b>

            <TimeResolutionOptions />
        </p>
    </div>
}

export const DisplayOptionsSidePanel = connector(_DisplayOptionsSidePanel) as FunctionalComponent<{}>



const validity_display_options: { id: ValidityFilterTypes, title: string }[] = [
    { id: "hide_invalid", title: "Hide Invalid" },
    { id: "show_invalid", title: "Show Invalid" },
]
