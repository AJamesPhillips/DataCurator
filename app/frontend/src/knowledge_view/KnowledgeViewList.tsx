import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { EditableTextSingleLine } from "../form/editable_text/EditableTextSingleLine"
import { ExpandableListWithAddButton } from "../form/editable_list/ExpandableListWithAddButton"
import { factory_render_list_content } from "../form/editable_list/render_list_content"
import type { KnowledgeView } from "../shared/wcomponent/interfaces/knowledge_view"
import { date2str } from "../shared/utils/date_helpers"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { Link } from "../sharedf/Link"
import { create_new_knowledge_view } from "./create_new_knowledge_view"
import { FoundationKnowledgeViewsList } from "./FoundationKnowledgeViewsList"
import { optional_view_type } from "../views/optional_view_type"
import type { ViewType } from "../state/routing/interfaces"
import { EditableCheckbox } from "../form/EditableCheckbox"
import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import type { AutocompleteOption } from "../form/Autocomplete/interfaces"



interface OwnProps {}


const map_state = (state: RootState) => ({
    ready: state.sync.ready,
    base_knowledge_view: state.derived.base_knowledge_view,
    other_knowledge_views: state.derived.other_knowledge_views,
    creation_context: state.creation_context,
    current_view: state.routing.args.view,
    editing: !state.display_options.consumption_formatting,
})

const map_dispatch = {
    upsert_knowledge_view: ACTIONS.specialised_object.upsert_knowledge_view,
}

const connector = connect(map_state, map_dispatch)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _KnowledgeViewList (props: Props)
{
    const { ready, base_knowledge_view, other_knowledge_views, current_view, editing } = props

    if (!base_knowledge_view)
    {
        return <div style={{ cursor: "progress" }}>
            {ready ? "Automatically creating base knowledge view..." : "Loading..." }
        </div>
    }

    const knowledge_views: KnowledgeView[] = [ base_knowledge_view, ...other_knowledge_views ]
    const parent_knowledge_view_options = knowledge_views.map(kv => ({ id: kv.id, title: kv.title }))


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

            item_top_props: {
                get_summary: factory_get_summary(current_view),
                get_details: factory_get_details(editing, parent_knowledge_view_options),
                get_details3,
            },

            debug_item_descriptor: "Knowledge View",
        })}
        item_descriptor="Knowledge View"
        disable_collapsed={true}
    />
}

export const KnowledgeViewList = connector(_KnowledgeViewList) as FunctionComponent<OwnProps>



function factory_get_summary (current_view: ViewType)
{
    const view = optional_view_type(current_view)

    return (knowledge_view: KnowledgeView, on_change: (new_kv: KnowledgeView) => void) => <Link
        route={undefined}
        sub_route={undefined}
        item_id={undefined}
        args={{ view, subview_id: knowledge_view.id }}
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


const factory_get_details = (editing: boolean, parent_knowledge_view_options: AutocompleteOption[]) => (knowledge_view: KnowledgeView, on_change: (new_kv: KnowledgeView) => void) =>
{

    return <div style={{ backgroundColor: "white", border: "thin solid #aaa", borderRadius: 3, padding: 5, margin: 5 }}>
        <p style={{ display: "inline-flex" }}>
            <span className="description_label">Title</span> &nbsp; <EditableTextSingleLine
                placeholder="Title..."
                value={knowledge_view.title}
                on_blur={new_title => {
                    const default_title = knowledge_view.is_base ? "Base" : make_default_title()
                    on_change({ ...knowledge_view, title: new_title || default_title })
                }}
            />
        </p>

        <div>
            <span className="description_label">Allow counterfactuals</span>
            <EditableCheckbox
                disabled={knowledge_view.is_base || !editing}
                value={knowledge_view.allows_assumptions}
                on_change={() =>
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


        <p>
            <span className="description_label">Nest under</span>
            <AutocompleteText
                selected_option_id={knowledge_view.parent_knowledge_view_id}
                allow_none={true}
                options={parent_knowledge_view_options.filter(({ id }) => id !== knowledge_view.id)}
                on_change={parent_knowledge_view_id =>
                {
                    on_change({ ...knowledge_view, parent_knowledge_view_id })
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
