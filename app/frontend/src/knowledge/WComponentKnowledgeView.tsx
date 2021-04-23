import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { lefttop_to_xy, MoveToPositionButton } from "../canvas/MoveToPositionButton"
import { ConfirmatoryDeleteButton } from "../form/ConfirmatoryDeleteButton"
import { EditablePosition } from "../form/EditablePosition"
import { KnowledgeViewWComponentEntry, wcomponent_is_plain_connection } from "../shared/models/interfaces/SpecialisedObjects"
import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import { get_current_knowledge_view_from_state, get_wcomponent_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"



interface OwnProps
{
    wcomponent_id: string
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    return {
        wcomponent: get_wcomponent_from_state(state, own_props.wcomponent_id),
        current_knowledge_view: get_current_knowledge_view_from_state(state),
    }
}


const map_dispatch = {
    upsert_knowledge_view_entry: ACTIONS.specialised_object.upsert_knowledge_view_entry,
    delete_knowledge_view_entry: ACTIONS.specialised_object.delete_knowledge_view_entry,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentKnowledgeView (props: Props)
{
    const { wcomponent_id, wcomponent, current_knowledge_view } = props

    if (!wcomponent) return <div>Component of ID: {wcomponent_id} does not exist</div>

    if (!current_knowledge_view) return <div>No current knowledge view selected</div>


    const knowledge_view_id = current_knowledge_view.id
    const entry = current_knowledge_view.wc_id_map[wcomponent_id]

    function update (arg: Partial<KnowledgeViewWComponentEntry>)
    {
        const new_entry: KnowledgeViewWComponentEntry = {
            ...(entry || { left: 0, top: 0 }),
            ...arg,
        }
        props.upsert_knowledge_view_entry({
            wcomponent_id,
            knowledge_view_id,
            entry: new_entry,
        })
    }


    function delete_entry ()
    {
        props.delete_knowledge_view_entry({
            wcomponent_id,
            knowledge_view_id,
        })
    }


    if (!entry)
    {
        return <div>
            Current Knowledge View: <br />
            {current_knowledge_view.title} <br />

            <Button
                value="Add to current knowledge view"
                extra_class_names="left"
                size="normal"
                on_pointer_down={() => update({})}
            />
        </div>
    }


    return <div>
        Current Knowledge View: <br />
        {current_knowledge_view.title} <br />
        <br />

        {!wcomponent_is_plain_connection(wcomponent) && [
        <div>
            Position:
            <MoveToPositionButton
                description="Show node"
                move_to_xy={lefttop_to_xy({ ...entry, zoom: 100 }, true)}
            />
            <EditablePosition point={entry} on_update={update} />
        </div>,
        <br />,
        ]}

        {entry && <div>
            <ConfirmatoryDeleteButton
                on_delete={() => delete_entry()}
            />
            Remove from current knowledge view
        </div>}
    </div>
}

export const WComponentKnowledgeView = connector(_WComponentKnowledgeView) as FunctionalComponent<OwnProps>
