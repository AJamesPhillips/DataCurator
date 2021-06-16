import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { EditablePosition } from "../form/EditablePosition"
import { SelectKnowledgeView } from "../knowledge_view/SelectKnowledgeView"
import { Button } from "../sharedf/Button"



interface OwnProps {}

const map_state = (state: RootState) =>
{
    return {
        ready: state.sync.ready,
        wcomponent_ids: state.meta_wcomponents.selected_wcomponent_ids,
    }
}


const map_dispatch = {
    bulk_edit_knowledge_view_entries: ACTIONS.specialised_object.bulk_edit_knowledge_view_entries,
    bulk_add_to_knowledge_view: ACTIONS.specialised_object.bulk_add_to_knowledge_view,
    snap_to_grid_knowledge_view_entries: ACTIONS.specialised_object.snap_to_grid_knowledge_view_entries,
}


const connector = connect(map_state, map_dispatch)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _WComponentMultipleForm (props: Props)
{
    if (!props.ready) return <div>Loading...</div>

    const { wcomponent_ids: ids, bulk_edit_knowledge_view_entries, bulk_add_to_knowledge_view } = props
    const wcomponent_ids = Array.from(ids)

    return <div>
        <h2>Bulk editing {wcomponent_ids.length} components</h2>

        <p>
            Position:
            <EditablePosition
                point={{ left: 0, top: 0 }}
                on_update={p => {
                    bulk_edit_knowledge_view_entries({
                        wcomponent_ids,
                        change_left: p.left,
                        change_top: p.top,
                    })
                }}
            />
        </p>

        <p>
            <Button
                value="Snap to grid"
                on_pointer_down={() => props.snap_to_grid_knowledge_view_entries({ wcomponent_ids })}
                is_left={true}
            />
        </p>

        <hr />

        <p>
            Add to knowledge view
            <SelectKnowledgeView
                on_change={knowledge_view_id =>
                {
                    if (!knowledge_view_id) return

                    bulk_add_to_knowledge_view({
                        knowledge_view_id,
                        wcomponent_ids: Array.from(wcomponent_ids),
                    })
                }}
            />
        </p>

    </div>
}


export const WComponentMultipleForm = connector(_WComponentMultipleForm) as FunctionComponent<OwnProps>
