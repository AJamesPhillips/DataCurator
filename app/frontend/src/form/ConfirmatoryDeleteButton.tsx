import { FunctionalComponent, h } from "preact"

import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import { Button } from "../sharedf/Button"
import type { RootState } from "../state/State"



interface OwnProps
{
    on_delete?: () => void
}



const map_state = (state: RootState) => ({
    consumption_formatting: state.display_options.consumption_formatting,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ConfirmatoryDeleteButton (props: Props)
{
    const [deleting, set_deleting] = useState(false)

    if (props.consumption_formatting) return null

    return <div className="button_container_confirmatory_delete">
        <Button
            is_hidden={!deleting}
            value="CONFIRM"
            extra_class_names="button_warning"
            onClick={() => props.on_delete && props.on_delete()}
        />

        <Button
            is_hidden={!props.on_delete}
            value={deleting ? "CANCEL" : "DELETE"}
            extra_class_names={(deleting ? "" : " button_warning ")}
            onClick={() => set_deleting(!deleting) }
        />
    </div>
}

export const ConfirmatoryDeleteButton = connector(_ConfirmatoryDeleteButton) as FunctionalComponent<OwnProps>
