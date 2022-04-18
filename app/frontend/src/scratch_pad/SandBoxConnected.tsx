import { h, FunctionalComponent } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import { EditableText } from "../form/editable_text/EditableText"
import { EditableTextSingleLine } from "../form/editable_text/EditableTextSingleLine"
import { EditableTextOnBlurType } from "../form/editable_text/editable_text_common"
import type { RootState } from "../state/State"
import "./SandBox.css"



const map_state = (state: RootState) =>
{
    return {}
}



const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



function _SandBoxConnected (props: Props)
{
    const [some_string, set_some_string] = useState("testing 123")

    return <div>
        <EditableTextSingleLine
            placeholder="1"
            force_focus_on_first_render={true}
            value={some_string}
            on_blur={set_some_string}
            on_blur_type={EditableTextOnBlurType.conditional}
        />
        {/* <EditableText
            placeholder="2"
            force_focus={false}
            value=""
            conditional_on_blur={() => {}}
        />
        <AutocompleteText
            selected_option_id={undefined}
            options={[]}
            allow_none={true}
            on_change={() => {}}
        /> */}
    </div>
}

export const SandBoxConnected = connector(_SandBoxConnected) as FunctionalComponent<{}>
