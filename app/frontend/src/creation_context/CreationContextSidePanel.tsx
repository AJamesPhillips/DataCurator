import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { EditableText } from "../form/editable_text/EditableText"
import { EditableCheckbox } from "../form/EditableCheckbox"
import { EditableCustomDateTime } from "../form/EditableCustomDateTime"
import { LabelsEditor } from "../labels/LabelsEditor"
import { Link } from "../sharedf/Link"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"



const map_state = (state: RootState) =>
{
    const { creation_context } = state.creation_context
    return {
        use_creation_context: state.creation_context.use_creation_context,
        custom_created_at: creation_context?.custom_created_at,
        label_ids: creation_context?.label_ids,
        replace_text_target: creation_context?.replace_text_target,
        replace_text_replacement: creation_context?.replace_text_replacement,
    }
}

const map_dispatch = {
    toggle_use_creation_context: ACTIONS.creation_context.toggle_use_creation_context,
    set_custom_created_at: ACTIONS.creation_context.set_custom_created_at,
    set_label_ids: ACTIONS.creation_context.set_label_ids,
    set_replace_text: ACTIONS.creation_context.set_replace_text,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _CreationContextSidePanel (props: Props)
{
    return <div>
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

        <p>
            Automatically replace text:
            <br /><EditableText
                placeholder="Target text..."
                value={props.replace_text_target || ""}
                conditional_on_change={t => props.set_replace_text({
                    value: t || undefined,
                    value_type: "target",
                })}
            />
            <br /><EditableText
                placeholder="Replacement text..."
                value={props.replace_text_replacement || ""}
                conditional_on_change={t => props.set_replace_text({
                    value: t || undefined,
                    value_type: "replacement",
                })}
            />
        </p>
    </div>
}

export const CreationContextSidePanel = connector(_CreationContextSidePanel) as FunctionalComponent<{}>
