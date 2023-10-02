import Markdown from "markdown-to-jsx"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { Link } from "../../sharedf/Link"

import { lefttop_to_xy } from "../../state/display_options/display"
import type { RootState } from "../../state/State"
import { get_title } from "../../sharedf/rich_text/get_rich_text"
import type { WComponentMoveBaseConflicts } from "./calc_ids_to_move_and_conflicts"



interface OwnProps
{
    wcomponents_move_conflicts: WComponentMoveBaseConflicts | undefined
}


const map_state = (state: RootState) =>
({
    wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentMoveConflicts (props: Props)
{
    const { wcomponents_move_conflicts, wcomponents_by_id, knowledge_views_by_id } = props

    const created_at_ms = new Date().getTime()
    const sim_ms = created_at_ms


    return <div>
        {Object.entries(wcomponents_move_conflicts || {}).map(([ wc_id, conflicts ], index) =>
        {
            const wcomponent = wcomponents_by_id[wc_id]
            const wcomponent_title = (wcomponent && get_title({ wcomponent, wcomponents_by_id, knowledge_views_by_id, wc_id_to_counterfactuals_map: undefined, created_at_ms, sim_ms })) || wc_id

            return <div key={wc_id}>
                <Link
                    route="wcomponents"
                    sub_route={undefined}
                    item_id={wc_id}
                    args={undefined}
                >
                    Component "<Markdown>{wcomponent_title}</Markdown>" in:
                </Link>

                <ul>
                {conflicts.map(conflict =>
                {
                    const knowledge_view = knowledge_views_by_id[conflict.kv_id]
                    const knowledge_view_title = knowledge_view?.title || conflict.kv_id
                    const position_for_middle_of_screen = lefttop_to_xy(conflict, true)

                    return <li>
                        <Link
                            route="wcomponents"
                            sub_route={undefined}
                            item_id={wc_id}
                            args={{ subview_id: conflict.kv_id, ...position_for_middle_of_screen, }}
                        >
                            &nbsp; &nbsp; {knowledge_view_title}
                        </Link>
                    </li>
                })}
                </ul>
                {/* TODO offer options to: ignore, delete from others, do not move (delete from these knowledge views) */}
            </div>
        })}
    </div>
}

export const WComponentMoveConflicts = connector(_WComponentMoveConflicts) as FunctionalComponent<OwnProps>
