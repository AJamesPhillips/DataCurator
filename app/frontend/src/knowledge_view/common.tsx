import { h } from "preact"

import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import type { ListItemCRUDRequiredU } from "../form/editable_list/EditableListEntry"
import { EditableText } from "../form/editable_text/EditableText"
import { EditableTextSingleLine } from "../form/editable_text/EditableTextSingleLine"
import { get_today_str } from "../shared/utils/date_helpers"
import { is_defined } from "../shared/utils/is_defined"
import { KnowledgeView, knowledge_view_sort_types } from "../shared/interfaces/knowledge_view"
import type { NestedKnowledgeViewIdsMap } from "../state/derived/State"
import { FoundationKnowledgeViewsList } from "./FoundationKnowledgeViewsList"
import type { KnowledgeViewFormProps } from "./interfaces"
import { KnowledgeViewActiveCounterFactuals } from "./KnowledgeViewActiveCounterfactuals"
import { KnowledgeViewListsSet } from "./KnowledgeViewListsSet"
import { KnowledgeViewDatetimeLinesConfigForm } from "./KnowledgeViewDatetimeLinesConfigForm"
import { Link } from "../sharedf/Link"
import { ExternalLinkIcon } from "../sharedf/icons/ExternalLinkIcon"
import { create_wcomponent } from "../state/specialised_objects/wcomponents/create_wcomponent_type"
import { KnowledgeViewChangeBase } from "./change_base/KnowledgeViewChangeBase"



export function get_all_parent_knowledge_view_ids (nested_knowledge_view_ids_map: NestedKnowledgeViewIdsMap, current_subview_id: string)
{
    const all_parent_ids = new Set<string>()
    let nested_entry = nested_knowledge_view_ids_map[current_subview_id]
    while (nested_entry && nested_entry.parent_id)
    {
        all_parent_ids.add(nested_entry.parent_id)
        nested_entry = nested_knowledge_view_ids_map[nested_entry.parent_id]
    }

    return all_parent_ids
}



export const make_default_kv_title = () => get_today_str(false)



export const factory_get_kv_details = (props: KnowledgeViewFormProps) => (knowledge_view: KnowledgeView, crud: ListItemCRUDRequiredU<KnowledgeView>) =>
{
    const { editing, nested_knowledge_view_ids } = props
    const nested_kv = nested_knowledge_view_ids.map[knowledge_view.id]
    const children = (nested_kv?.child_ids || []).map(id => props.knowledge_views_by_id[id])
        .filter(is_defined)
    const has_wcomponent = !!props.wcomponents_by_id[knowledge_view?.id || ""]


    const is_current_kv = props.current_subview_id === knowledge_view.id


    return <div style={{ backgroundColor: "white", border: "thin solid #aaa", borderRadius: 3, padding: 5, margin: 5 }}>
        <p style={{ display: "inline-flex" }}>
            <EditableTextSingleLine
                placeholder="Title"
                value={knowledge_view.title}
                conditional_on_blur={new_title => {
                    const default_title = knowledge_view.is_base ? "All" : make_default_kv_title()
                    crud.update_item({ ...knowledge_view, title: new_title ?? default_title })
                }}
            />

            {has_wcomponent && <Link
                route="wcomponents"
                sub_route={undefined}
                item_id={knowledge_view.id}
                args={undefined}
            ><ExternalLinkIcon />Component</Link>}

            {!has_wcomponent && editing && <span
                style={{ cursor: "pointer" }}
                onClick={() =>
                {
                    create_wcomponent({ wcomponent: {
                        base_id: knowledge_view.base_id,
                        id: knowledge_view.id,
                        title: knowledge_view.title,
                        type: "statev2",
                    }})
                }}
            >
                <ExternalLinkIcon />Create Component
            </span>}
        </p>


        {/* <p>{knowledge_view.is_base ? "All container" : "Normal"}</p> */}


        {(editing || knowledge_view.description) && <p>
            {editing && <span className="description_label">Description</span>} &nbsp;
            <EditableText
                placeholder="..."
                value={knowledge_view.description}
                conditional_on_blur={description => {
                    crud.update_item({ ...knowledge_view, description })
                }}
            />
        </p>}


        <div>
            <span className="description_label">Active assumptions (counterfactuals)</span>
            <KnowledgeViewActiveCounterFactuals
                knowledge_view_id={knowledge_view.id}
                on_change={ids => crud.update_item({ ...knowledge_view, active_counterfactual_v2_ids: ids })}
            />
        </div>


        <p>
            <FoundationKnowledgeViewsList
                owner_knowledge_view={knowledge_view}
                on_change={foundation_knowledge_view_ids =>
                {
                    crud.update_item({ ...knowledge_view, foundation_knowledge_view_ids })
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
                    crud.update_item({ ...knowledge_view, parent_knowledge_view_id })
                }}
            />
        </p>}


        {editing && <p>
            <span className="description_label">Sort status</span>
            <AutocompleteText
                selected_option_id={knowledge_view.sort_type}
                options={knowledge_view_sort_types.map(type => ({ id: type, title: type }))}
                allow_none={false}
                on_change={sort_type => sort_type && crud.update_item({ ...knowledge_view, sort_type })}
            />
        </p>}


        <hr />

        {editing && !is_current_kv && <div>
            <Link
                route={undefined}
                sub_route={undefined}
                item_id={undefined}
                args={{ subview_id: knowledge_view.id }}
            >
                Change to this knowledge view
            </Link> to edit datetime lines config and change the base.
        </div>}

        {editing && is_current_kv && <div>
            <KnowledgeViewDatetimeLinesConfigForm
                editing={editing}
                knowledge_view={knowledge_view}
                knowledge_views_by_id={props.knowledge_views_by_id}
                update_item={crud.update_item}
            />

            <hr />

            <KnowledgeViewChangeBase
                knowledge_view={knowledge_view}
            />


            <hr />
            <br />
        </div>}


        {(editing || children.length > 0) && <p>
            <KnowledgeViewListsSet
                {...props}
                parent_knowledge_view_id={knowledge_view.id}
                knowledge_views={children}
                item_descriptor="Nested"
            />
        </p>}


        <br />
    </div>
}
