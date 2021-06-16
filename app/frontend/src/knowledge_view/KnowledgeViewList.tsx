import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { EditableTextSingleLine } from "../form/EditableTextSingleLine"
import { ExpandableListWithAddButton } from "../form/editable_list/ExpandableListWithAddButton"
import { factory_render_list_content } from "../form/editable_list/render_list_content"
import type { KnowledgeView } from "../shared/wcomponent/interfaces/knowledge_view"
import { date2str } from "../shared/utils/date_helpers"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { Link } from "../sharedf/Link"
import { create_new_knowledge_view } from "./create_new_knowledge_view"
import { FoundationKnowledgeViewsList } from "./FoundationKnowledgeViewsList"
import { sort_list } from "../shared/utils/sort"



interface OwnProps {}


const map_state = (state: RootState) => ({
    ready: state.sync.ready,
    base_knowledge_view: state.derived.base_knowledge_view,
    other_knowledge_views: state.derived.other_knowledge_views,
    creation_context: state.creation_context,
})

const map_dispatch = {
    upsert_knowledge_view: ACTIONS.specialised_object.upsert_knowledge_view,
}

const connector = connect(map_state, map_dispatch)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _KnowledgeViewList (props: Props)
{
    const { ready, base_knowledge_view, other_knowledge_views } = props

    if (!base_knowledge_view)
    {
        return <div style={{ cursor: "progress" }}>
            {ready ? "Automatically creating base knowledge view..." : "Loading..." }
        </div>
    }

    const sorted_other_knowledge_views = sort_list(other_knowledge_views, kv => kv.title, "ascending")

    const knowledge_views: KnowledgeView[] = [ base_knowledge_view, ...sorted_other_knowledge_views ]


    return <ExpandableListWithAddButton
        items_count={knowledge_views.length}
        on_click_new_item={() =>
        {
            const knowledge_view = create_new_knowledge_view({ title: make_default_title() }, props.creation_context)
            props.upsert_knowledge_view({ knowledge_view })
        }}
        content={factory_render_list_content({
            items: knowledge_views,
            get_id: kv => kv.id,
            update_items: new_kvs =>
            {
                const changed_kv = new_kvs.find((new_kv, index) => knowledge_views[index] !== new_kv)
                if (!changed_kv) return
                props.upsert_knowledge_view({ knowledge_view: changed_kv })
            },

            item_top_props: { get_summary, get_details, get_details3 },

            debug_item_descriptor: "Knowledge View",
        })}
        item_descriptor="Knowledge View"
        disable_collapsed={true}
    />
}

export const KnowledgeViewList = connector(_KnowledgeViewList) as FunctionComponent<OwnProps>



function get_summary (knowledge_view: KnowledgeView, on_change: (new_kv: KnowledgeView) => void)
{
    return <Link
        route={undefined}
        sub_route={undefined}
        item_id={undefined}
        args={{ view: "knowledge", subview_id: knowledge_view.id }}
        selected_on={new Set(["route", "args.subview_id"])}
    >
        {get_knowledge_view_title(knowledge_view)}
    </Link>
}


function get_knowledge_view_title (knowledge_view: KnowledgeView)
{
    if (!knowledge_view.is_base) return knowledge_view.title
    return knowledge_view.title !== "Base"
        ? `Base (${knowledge_view.title})`
        : "Base"
}


const make_default_title = () => date2str(new Date(), "yyyy-MM-dd")


function get_details (knowledge_view: KnowledgeView, on_change: (new_kv: KnowledgeView) => void)
{

    return <div style={{ backgroundColor: "white", border: "thin solid #aaa", borderRadius: 3, padding: 5, margin: 5 }}>
        <p style={{ display: "inline-flex" }}>
            Title: <EditableTextSingleLine
                placeholder="Title..."
                value={knowledge_view.title}
                on_change={new_title => {
                    const default_title = knowledge_view.is_base ? "Base" : make_default_title()
                    on_change({ ...knowledge_view, title: new_title || default_title })
                }}
            />
        </p>

        <div>
            Allow counterfactuals:
            <input
                type="checkbox"
                checked={knowledge_view.allows_assumptions}
                disabled={knowledge_view.is_base}
                onClick={() =>
                {
                    const allows_assumptions = knowledge_view.allows_assumptions ? undefined : true
                    on_change({ ...knowledge_view, allows_assumptions })
                }}
            />
        </div>

        <p>
            <FoundationKnowledgeViewsList
                owner_knowledge_view={knowledge_view}
                on_change={foundation_knowledge_view_ids =>
                {
                    on_change({ ...knowledge_view, foundation_knowledge_view_ids })
                }}
            />
        </p>

        <br />
    </div>
}



function get_details3 ()
{
    return <div><br /><br /></div>
}
