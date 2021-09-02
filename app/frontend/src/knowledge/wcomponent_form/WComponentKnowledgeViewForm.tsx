import { Box } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { MoveToWComponentButton } from "../../canvas/MoveToWComponentButton"
import { ConfirmatoryDeleteButton } from "../../form/ConfirmatoryDeleteButton"
import { SelectKnowledgeView } from "../../knowledge_view/SelectKnowledgeView"
import type { KnowledgeViewWComponentEntry } from "../../shared/wcomponent/interfaces/knowledge_view"
import { Button } from "../../sharedf/Button"
import { Link } from "../../sharedf/Link"
import { ACTIONS } from "../../state/actions"
import { get_middle_of_screen } from "../../state/display_options/display"
import {
    get_current_knowledge_view_from_state,
    get_current_composed_knowledge_view_from_state,
    get_wcomponent_from_state,
} from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { ExploreButtonHandle } from "../canvas_node/ExploreButtonHandle"



interface OwnProps
{
    wcomponent_id: string
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { wcomponent_id } = own_props

    const current_knowledge_view = get_current_knowledge_view_from_state(state)

    const knowledge_view_entry = current_knowledge_view && current_knowledge_view.wc_id_map[wcomponent_id]
    const current_composed_knowledge_view = get_current_composed_knowledge_view_from_state(state)
    const composed_knowledge_view_entry = current_composed_knowledge_view && current_composed_knowledge_view.composed_wc_id_map[wcomponent_id]
    const all_knowledge_views = state.derived.knowledge_views
    const middle_position = get_middle_of_screen(state)

    return {
        wcomponent: get_wcomponent_from_state(state, wcomponent_id),
        knowledge_view_id: current_knowledge_view && current_knowledge_view.id,
        knowledge_view_title: current_knowledge_view && current_knowledge_view.title,
        composed_knowledge_view_entry,
        knowledge_view_entry,
        all_knowledge_views,
        editing: !state.display_options.consumption_formatting,
        middle_position_left: middle_position.left,
        middle_position_top: middle_position.top,
    }
}


const map_dispatch = {
    upsert_knowledge_view_entry: ACTIONS.specialised_object.upsert_knowledge_view_entry,
    delete_knowledge_view_entry: ACTIONS.specialised_object.delete_knowledge_view_entry,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentKnowledgeViewForm (props: Props)
{
    const { wcomponent_id, wcomponent, knowledge_view_id, knowledge_view_title, composed_knowledge_view_entry,
        knowledge_view_entry, all_knowledge_views, editing } = props

    if (!wcomponent) return <div>Component of ID: {wcomponent_id} does not exist</div>


    const other_knowledge_views = all_knowledge_views
        .filter(({ id }) => id !== knowledge_view_id)
        .filter(({ wc_id_map }) => wc_id_map[wcomponent_id])


    function update (knowledge_view_id: string)
    {
        const new_entry: KnowledgeViewWComponentEntry = {
            ...(composed_knowledge_view_entry || { left: props.middle_position_left, top: props.middle_position_top }),
        }

        props.upsert_knowledge_view_entry({
            wcomponent_id,
            knowledge_view_id,
            entry: new_entry,
        })
    }


    function delete_entry (knowledge_view_id: string)
    {
        props.delete_knowledge_view_entry({
            wcomponent_id,
            knowledge_view_id,
        })
    }

    return <div>
        {!knowledge_view_entry && knowledge_view_id && <div>
            Not present in this knowledge view
            {composed_knowledge_view_entry && " but is present in a foundational knowledge view"}
            <br />
            {editing && <Button
                value="Add to current knowledge view"
                extra_class_names="left"
                onClick={() => update(knowledge_view_id)}
            />}
        </div>}


        {composed_knowledge_view_entry && <div style={{ display: "inline-flex" }}>
            <MoveToWComponentButton wcomponent_id={wcomponent.id} />

            <Box zIndex={10} m={4} class="node_handle">
                <ExploreButtonHandle
                    wcomponent_id={wcomponent.id}
                    wcomponent_current_kv_entry={composed_knowledge_view_entry}
                    is_highlighted={true}
                />
            </Box>
        </div>}

        {/* {knowledge_view_entry && !wcomponent_is_plain_connection(wcomponent) && <div>
            Position:
            <EditablePosition point={knowledge_view_entry} on_update={update} />
        </div>} */}

        {(editing && knowledge_view_id && knowledge_view_entry) && <div>
            <ConfirmatoryDeleteButton
                button_text="Remove from knowledge view"
                tooltip_text={"Remove from current knowledge view (" + knowledge_view_title + ")"}
                on_delete={() => delete_entry(knowledge_view_id)}
            />
        </div>}


        {editing && <p>
            Add to knowledge view
            <SelectKnowledgeView
                on_change={knowledge_view_id =>
                {
                    if (!knowledge_view_id) return

                    update(knowledge_view_id)
                }}
            />
        </p>}


        {other_knowledge_views.length > 0 && <div>
            <br />
            Also in:
            {other_knowledge_views.map(kv => <div>
                <Link route={undefined} sub_route={undefined} item_id={undefined} args={{ subview_id: kv.id }}>
                    {kv.title}
                </Link>
            </div>)}
        </div>}
    </div>
}

export const WComponentKnowledgeViewForm = connector(_WComponentKnowledgeViewForm) as FunctionalComponent<OwnProps>
