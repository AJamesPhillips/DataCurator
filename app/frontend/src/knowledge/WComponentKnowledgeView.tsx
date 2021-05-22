import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { lefttop_to_xy, MoveToPositionButton } from "../canvas/MoveToPositionButton"
import { ConfirmatoryDeleteButton } from "../form/ConfirmatoryDeleteButton"
import type { KnowledgeViewWComponentEntry } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import { get_current_knowledge_view_from_state, get_current_UI_knowledge_view_from_state, get_wcomponent_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"



interface OwnProps
{
    wcomponent_id: string
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const knowledge_view = get_current_knowledge_view_from_state(state)
    const knowledge_view_entry = knowledge_view && knowledge_view.wc_id_map[own_props.wcomponent_id]
    const current_UI_knowledge_view = get_current_UI_knowledge_view_from_state(state)
    const UI_knowledge_view_entry = current_UI_knowledge_view && current_UI_knowledge_view.derived_wc_id_map[own_props.wcomponent_id]

    return {
        wcomponent: get_wcomponent_from_state(state, own_props.wcomponent_id),
        knowledge_view_id: knowledge_view && knowledge_view.id,
        knowledge_view_title: knowledge_view && knowledge_view.title,
        UI_knowledge_view_entry,
        knowledge_view_entry,
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
    const { wcomponent_id, wcomponent, knowledge_view_id, knowledge_view_title, UI_knowledge_view_entry, knowledge_view_entry } = props

    if (!wcomponent) return <div>Component of ID: {wcomponent_id} does not exist</div>

    if (!knowledge_view_id) return <div>No current knowledge view selected</div>


    function update (arg: Partial<KnowledgeViewWComponentEntry>)
    {
        const new_entry: KnowledgeViewWComponentEntry = {
            ...(UI_knowledge_view_entry || { left: 0, top: 0 }),
            ...arg,
        }
        props.upsert_knowledge_view_entry({
            wcomponent_id,
            knowledge_view_id: knowledge_view_id!,
            entry: new_entry,
        })
    }


    function delete_entry ()
    {
        props.delete_knowledge_view_entry({
            wcomponent_id,
            knowledge_view_id: knowledge_view_id!,
        })
    }


    return <div>
        {!knowledge_view_entry && <div>
            Not present in this knowledge view
            {UI_knowledge_view_entry && " but is present in a foundational knowledge view"}
            <br />
            <Button
                value="Add to current knowledge view"
                extra_class_names="left"
                size="normal"
                on_pointer_down={() => update({})}
            />
        </div>}


        {knowledge_view_entry && <div>
            <MoveToPositionButton
                description="Show node"
                move_to_xy={lefttop_to_xy({ ...knowledge_view_entry, zoom: 100 }, true)}
            />
        </div>}

        {/* {knowledge_view_entry && !wcomponent_is_plain_connection(wcomponent) && <div>
            Position:
            <EditablePosition point={knowledge_view_entry} on_update={update} />
        </div>} */}

        {knowledge_view_entry && <div>
            <br />
            <ConfirmatoryDeleteButton
                on_delete={() => delete_entry()}
            />
            Remove from current knowledge view ({knowledge_view_title})
        </div>}
    </div>
}

export const WComponentKnowledgeView = connector(_WComponentKnowledgeView) as FunctionalComponent<OwnProps>
