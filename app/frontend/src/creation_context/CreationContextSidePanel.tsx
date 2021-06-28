import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { EditableCheckbox } from "../form/EditableCheckbox"
import { EditableCustomDateTime } from "../form/EditableCustomDateTime"
import { LabelsEditor } from "../labels/LabelsEditor"
import { Link } from "../sharedf/Link"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"



const map_state = (state: RootState) => ({
    use_creation_context: state.creation_context.use_creation_context,
    custom_created_at: state.creation_context.creation_context.custom_created_at,
    label_ids: state.creation_context.creation_context.label_ids,
})

const map_dispatch = {
    toggle_use_creation_context: ACTIONS.creation_context.toggle_use_creation_context,
    set_custom_created_at: ACTIONS.creation_context.set_custom_created_at,
    set_label_ids: ACTIONS.creation_context.set_label_ids,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _CreationContextSidePanel (props: Props)
{
    return <div>
        <h3>Creation Context</h3>

        <p>
            Enabled: <EditableCheckbox
                value={props.use_creation_context}
                on_change={() => props.toggle_use_creation_context()}
            />
        </p>

        <p>
            Custom created at datetime: <EditableCustomDateTime
                value={props.custom_created_at}
                on_change={custom_created_at => props.set_custom_created_at({ custom_created_at })}
            />
            {props.custom_created_at !== undefined && <div style={{ backgroundColor: "pink" }}>
                Tip: you only need to set this for easing entry of historical data.  If you want to view
                the data you are currently entering in a lower time resolution then use the
                <Link route="display" sub_route={undefined} item_id={undefined} args={undefined}> display options </Link>
                to change the time resolution.
            </div>}
        </p>

        <p>
            Automatically label with: <LabelsEditor
                label_ids={props.label_ids}
                on_change={label_ids => props.set_label_ids({ label_ids })}
            />
        </p>
    </div>
}

export const CreationContextSidePanel = connector(_CreationContextSidePanel) as FunctionalComponent<{}>
