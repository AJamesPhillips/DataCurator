import { h } from "preact"

import { EditableTextSingleLine } from "../form/editable_text/EditableTextSingleLine"
import { ExpandableListWithAddButton } from "../form/editable_list/ExpandableListWithAddButton"
import { factory_render_list_content } from "../form/editable_list/render_list_content"
import type { KnowledgeView, KnowledgeViewsById } from "../shared/wcomponent/interfaces/knowledge_view"
import { date2str } from "../shared/utils/date_helpers"
import { Link } from "../sharedf/Link"
import { create_new_knowledge_view } from "./create_new_knowledge_view"
import { FoundationKnowledgeViewsList } from "./FoundationKnowledgeViewsList"
import { optional_view_type } from "../views/optional_view_type"
import type { ViewType } from "../state/routing/interfaces"
import { EditableCheckbox } from "../form/EditableCheckbox"
import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import type { CreationContextState } from "../shared/creation_context/state"
import type { NestedKnowledgeViewIdsMap } from "../state/derived/State"
import { is_defined } from "../shared/utils/is_defined"



interface OwnProps
{
    item_descriptor?: string
    parent_knowledge_view_id?: string
    possible_parent_knowledge_view_options: { id: string, title: string }[]
    knowledge_views: KnowledgeView[]
    nested_knowledge_view_ids_map: NestedKnowledgeViewIdsMap
    knowledge_views_by_id: KnowledgeViewsById
    creation_context: CreationContextState
    current_view: ViewType
    editing: boolean
    upsert_knowledge_view: (knowledge_view: KnowledgeView) => void
}

export function KnowledgeViewList (props: OwnProps)
{
    const { parent_knowledge_view_id, knowledge_views, current_view } = props

    return <ExpandableListWithAddButton
        items_count={knowledge_views.length}
        on_click_new_item={() =>
        {
            const knowledge_view = create_new_knowledge_view({
                title: make_default_title(),
                parent_knowledge_view_id,
            }, props.creation_context)
            props.upsert_knowledge_view(knowledge_view)
        }}
        content={factory_render_list_content({
            items: knowledge_views,
            get_id: kv => kv.id,
            update_items: new_kvs =>
            {
                const changed_kv = new_kvs.find((new_kv, index) => knowledge_views[index] !== new_kv)
                if (!changed_kv) return

                props.upsert_knowledge_view(changed_kv)
            },

            item_top_props: {
                get_summary: factory_get_summary(current_view),
                get_details: factory_get_details(props),
                get_details3,
            },

            debug_item_descriptor: "Knowledge View",
        })}
        item_descriptor={props.item_descriptor || "Knowledge View"}
        disable_collapsed={true}
    />
}



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


const factory_get_details = (props: OwnProps) => (knowledge_view: KnowledgeView, on_change: (new_kv: KnowledgeView) => void) =>
{
    const { editing, nested_knowledge_view_ids_map } = props
    const nested_kv = nested_knowledge_view_ids_map.map[knowledge_view.id]
    const children = (nested_kv?.child_ids || []).map(id => props.knowledge_views_by_id[id])
        .filter(is_defined)

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


        {(editing || nested_kv?.ERROR_is_circular) && <p>
            <span className="description_label">Nest under</span>

            {nested_kv?.ERROR_is_circular && <div style={{ backgroundColor: "pink" }}>
                Is circularly nested
            </div>}

            <AutocompleteText
                selected_option_id={knowledge_view.parent_knowledge_view_id}
                allow_none={true}
                options={props.possible_parent_knowledge_view_options.filter(({ id }) => id !== knowledge_view.id)}
                on_change={parent_knowledge_view_id =>
                {
                    on_change({ ...knowledge_view, parent_knowledge_view_id })
                }}
            />
        </p>}


        {(editing || children.length > 0) && <p>
            <KnowledgeViewList
                {...props}
                parent_knowledge_view_id={knowledge_view.id}
                knowledge_views={children}
                item_descriptor="Nested"
            />
        </p>}


        <br />
    </div>
}



function get_details3 ()
{
    return <div><br /><br /></div>
}
