import { h } from "preact"

import { ExpandableListWithAddButton } from "../form/editable_list/ExpandableListWithAddButton"
import { factory_render_list_content } from "../form/editable_list/render_list_content"
import type { KnowledgeView } from "../shared/wcomponent/interfaces/knowledge_view"
import { Link } from "../sharedf/Link"
import { create_new_knowledge_view } from "./create_new_knowledge_view"
import { optional_view_type } from "../views/optional_view_type"
import type { ViewType } from "../state/routing/interfaces"
import { ExpandableList, ExpandedListStates } from "../form/editable_list/ExpandableList"
import { sentence_case } from "../shared/utils/sentence_case"
import type { KnowledgeViewListProps } from "./interfaces"
import { factory_get_kv_details, make_default_kv_title } from "./common"



export function KnowledgeViewList (props: KnowledgeViewListProps)
{
    const { parent_knowledge_view_id, knowledge_views, current_view, sort_type } = props


    if (!props.editing && knowledge_views.length === 0) return null


    const render_list_content = factory_render_list_content({
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
            get_details: factory_get_kv_details(props),
            get_details3,
            calc_initial_custom_expansion_state: factory_calc_initial_custom_expansion_state(props),
        },

        debug_item_descriptor: "View",
    })


    const expanded_initial_state = calc_expanded_initial_state(props)


    if (sort_type === "hidden" || sort_type === "archived")
    {
        return <ExpandableList
            items_count={knowledge_views.length}
            content={render_list_content}
            item_descriptor={sentence_case(sort_type) + " " + (props.item_descriptor || "View")}
            disable_collapsed={false}
            expanded_initial_state={expanded_initial_state}
        />
    }


    const item_descriptor = (sort_type === "priority" ? "Priority " : "") + (props.item_descriptor || "View")


    return <ExpandableListWithAddButton
        items_count={knowledge_views.length}
        on_click_new_item={() =>
        {
            create_new_knowledge_view({
                knowledge_view: {
                    title: make_default_kv_title(),
                    parent_knowledge_view_id,
                    sort_type,
                },
                creation_context: props.creation_context,
            })
        }}
        content={render_list_content}
        item_descriptor={item_descriptor}
        disable_collapsed={true}
        expanded_initial_state={expanded_initial_state}
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



function get_details3 ()
{
    return <div><br /><br /></div>
}



function calc_expanded_initial_state (props: KnowledgeViewListProps): ExpandedListStates | undefined
{
    const { current_kv_parent_ids, knowledge_views, current_subview_id } = props

    const knowledge_views_contain_current_kv = !!knowledge_views.find(({ id }) =>
    {
        return (
            // this item in the list is the current knowledge view
            id === current_subview_id
            // this item in the list has the current knowledge view nested under it
            || current_kv_parent_ids.has(id)
        )
    })

    return knowledge_views_contain_current_kv ? ExpandedListStates.partial_expansion : undefined
}



function factory_calc_initial_custom_expansion_state (props: KnowledgeViewListProps)
{
    return (item: KnowledgeView) =>
    {
        return props.current_kv_parent_ids.has(item.id)
            // this item has the current knowledge view nested under it so expand it
            ? true
            : undefined
    }
}
