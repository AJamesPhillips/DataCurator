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
import { EditableCustomDateTime } from "../form/EditableCustomDateTime"
import { EditableNumber } from "../form/EditableNumber"



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


    return <div style={{ backgroundColor: "white", border: "thin solid #aaa", borderRadius: 3, padding: 5, margin: 5 }}>
        <p style={{ display: "inline-flex" }}>
            <EditableTextSingleLine
                placeholder="Title"
                value={knowledge_view.title}
                conditional_on_blur={new_title => {
                    const default_title = knowledge_view.is_base ? "All" : make_default_kv_title()
                    crud.update_item({ ...knowledge_view, title: new_title || default_title })
                }}
            />
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


        {(editing || knowledge_view.time_origin_ms !== undefined) && <p>
            <EditableCustomDateTime
                title="Time origin"
                value={knowledge_view.time_origin_ms ? new Date(knowledge_view.time_origin_ms) : undefined}
                on_change={time_origin_date =>
                {
                    const new_time_origin_ms = time_origin_date ? time_origin_date.getTime() : undefined
                    crud.update_item({ ...knowledge_view, time_origin_ms: new_time_origin_ms })
                }}
            />
        </p>}

        {(editing || (knowledge_view.time_origin_ms !== undefined && knowledge_view.time_scale !== undefined)) && <p>
            <EditableNumber
                placeholder="Time scale"
                value={knowledge_view.time_scale}
                allow_undefined={true}
                conditional_on_blur={new_time_scale =>
                {
                    crud.update_item({ ...knowledge_view, time_scale: new_time_scale })
                }}
            />
        </p>}

        {(editing || (knowledge_view.time_origin_ms !== undefined && knowledge_view.time_line_number !== undefined)) && <p>
            <EditableNumber
                placeholder="Time line number"
                value={knowledge_view.time_line_number}
                allow_undefined={true}
                conditional_on_blur={new_time_line_number =>
                {
                    crud.update_item({ ...knowledge_view, time_line_number: new_time_line_number })
                }}
                style={{ width: "70%" }}
            />
        </p>}

        {(editing || (knowledge_view.time_origin_ms !== undefined && knowledge_view.time_line_spacing_days !== undefined)) && <p>
            <EditableNumber
                placeholder="Days between time line"
                value={knowledge_view.time_line_spacing_days}
                allow_undefined={true}
                conditional_on_blur={new_time_line_spacing_days =>
                {
                    crud.update_item({ ...knowledge_view, time_line_spacing_days: new_time_line_spacing_days })
                }}
                style={{ width: "70%" }}
            />
        </p>}


        <br />
        <br />


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
