import { h } from "preact"

import { AutoCompleteOption, AutocompleteText } from "../form/AutocompleteText"
import { EditableCheckbox } from "../form/EditableCheckbox"



export function DisplayOptionsSidePanel (props: {})
{
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
        </p>
    </div>
}
