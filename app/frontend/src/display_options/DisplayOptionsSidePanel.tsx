import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../form/AutocompleteText"
import { ACTIONS } from "../state/actions"
import type { ValidityToCertaintyTypes } from "../state/display_options/state"
import type { RootState } from "../state/State"



const map_state = (state: RootState) => ({
    validity_to_certainty: state.display_options.validity_to_certainty,
})


const map_dispatch = {
    set_validity_to_certainty: ACTIONS.display.set_validity_to_certainty,
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
                selected_option_id={props.validity_to_certainty}
                allow_none={false}
                on_change={validity_to_certainty =>
                {
                    if (!validity_to_certainty) return

                    props.set_validity_to_certainty({ validity_to_certainty })
                }}
            />
        </p>
    </div>
}

export const DisplayOptionsSidePanel = connector(_DisplayOptionsSidePanel) as FunctionalComponent<{}>



const validity_display_options: { id: ValidityToCertaintyTypes, title: string }[] = [
    { id: "hide_invalid", title: "Hide Invalid" },
    { id: "show_invalid", title: "Show Invalid" },
]
