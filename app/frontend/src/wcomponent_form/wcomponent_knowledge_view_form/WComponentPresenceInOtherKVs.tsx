import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { Link } from "../../sharedf/Link"
import { lefttop_to_xy } from "../../state/display_options/display"
import { get_current_knowledge_view_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"



interface OwnProps
{
    wcomponent_id: string
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { wcomponent_id } = own_props
    const current_knowledge_view = get_current_knowledge_view_from_state(state)

    const knowledge_view_entry = current_knowledge_view && current_knowledge_view.wc_id_map[wcomponent_id]
    const all_knowledge_views = state.derived.knowledge_views

    return {
        knowledge_view_id: current_knowledge_view && current_knowledge_view.id,
        knowledge_view_entry,
        all_knowledge_views,
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentPresenceInOtherKVs (props: Props)
{
    const { knowledge_view_id, wcomponent_id, knowledge_view_entry } = props

    const other_knowledge_views = props.all_knowledge_views
        .filter(({ id }) => id !== knowledge_view_id)
        .filter(({ wc_id_map }) =>
        {
            const entry = wc_id_map[wcomponent_id]
            return entry && !entry.blocked && !entry.passthrough
        })


    if (other_knowledge_views.length === 0) return null


    const not_present = !knowledge_view_entry || knowledge_view_entry.blocked || knowledge_view_entry.passthrough

    return <div>
        {not_present ? "Present" : "Also"} in:
        {other_knowledge_views.map(kv =>
        {
            const entry = kv.wc_id_map[props.wcomponent_id]
            const pos = lefttop_to_xy(entry, true)

            return <div>
                <Link
                    route={undefined}
                    sub_route={undefined}
                    item_id={undefined}
                    args={{ subview_id: kv.id, ...pos }}
                >
                    {kv.title}
                </Link>
            </div>
        })}
    </div>
}

export const WComponentPresenceInOtherKVs = connector(_WComponentPresenceInOtherKVs) as FunctionalComponent<OwnProps>
