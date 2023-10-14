import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ConfirmatoryDeleteButton } from "../../form/ConfirmatoryDeleteButton"
import { ACTIONS } from "../../state/actions"
import { get_current_knowledge_view_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { WComponentKnowledgeViewForm } from "./WComponentKnowledgeViewForm"
import { WComponentPresenceInOtherKVs } from "./WComponentPresenceInOtherKVs"



interface OwnProps
{
    wcomponent_id: string
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const current_knowledge_view = get_current_knowledge_view_from_state(state)

    const knowledge_view_entry = current_knowledge_view && current_knowledge_view.wc_id_map[own_props.wcomponent_id]

    return {
        knowledge_view_title: current_knowledge_view && current_knowledge_view.title,
        knowledge_view_entry,
        editing: !state.display_options.consumption_formatting,
    }
}


const map_dispatch = {
    bulk_remove_from_knowledge_view: ACTIONS.specialised_object.bulk_remove_from_knowledge_view,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _NotFoundWComponentKnowledgeViewForm (props: Props)
{
    const { wcomponent_id, knowledge_view_title,
        knowledge_view_entry, editing } = props


    return <div>
        <WComponentKnowledgeViewForm
            wcomponent_id={wcomponent_id}
            // Not 100% sure this is correct (perhaps should include where user
            // is allowed to edit this as well) but it is true to the current implementation
            editing_allowed={editing}
        />

        {(editing && knowledge_view_entry && !knowledge_view_entry.passthrough) && <p>
            <ConfirmatoryDeleteButton
                button_text="Delete from knowledge view"
                tooltip_text={"Delete from current knowledge view (" + knowledge_view_title + ")"}
                on_delete={() =>
                {
                    props.bulk_remove_from_knowledge_view({
                        wcomponent_ids: [wcomponent_id],
                        remove_type: "passthrough",
                    })
                }}
            />
        </p>}


        <p>
            <WComponentPresenceInOtherKVs wcomponent_id={wcomponent_id} />
        </p>
    </div>
}

export const NotFoundWComponentKnowledgeViewForm = connector(_NotFoundWComponentKnowledgeViewForm) as FunctionalComponent<OwnProps>
