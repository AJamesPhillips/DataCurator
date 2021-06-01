import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutoCompleteOption, AutocompleteText } from "../form/AutocompleteText"
import { EditableCheckbox } from "../form/EditableCheckbox"
import { order_of_certainties } from "../shared/uncertainty/quantified_language"
import { get_validity_to_certainty_map } from "../state/display_options/display"
import type { RootState } from "../state/State"



const map_state = (state: RootState) => ({
    validity_to_certainty: state.display_options.validity_to_certainty,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



function _DisplayOptionsSidePanel (props: Props)
{

    const validity_to_certainty_map = get_validity_to_certainty_map(props.validity_to_certainty)

    const validity_display_options: AutoCompleteOption[] = [
        { id: "a", title: "Hide Invalid" },
        { id: "b", title: "Show Invalid" },
    ]

    return <div>
        <h3>Display Options</h3>

        <p>
            <b>Validity</b>

            <AutocompleteText
                placeholder=""
                options={validity_display_options}
                selected_option_id={"a"}
                on_change={() => {}}
            />

            <EditableCheckbox
                value={true}
                on_change={() => {}}
            />

            <table>
                <thead>
                    <tr>
                        <th>Certainty</th>
                        <th>Display</th>
                        <th>Opacity</th>
                    </tr>
                </thead>
                <tbody>
                    {order_of_certainties.map(certainty => <tr>
                        <td>{certainty}</td>
                        <td>Yes</td>
                        <td>100%</td>
                    </tr>)}
                </tbody>
            </table>
        </p>
    </div>
}

export const DisplayOptionsSidePanel = connector(_DisplayOptionsSidePanel) as FunctionalComponent<{}>
