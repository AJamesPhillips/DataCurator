import { h } from "preact"

import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import { EditableCheckbox } from "../form/EditableCheckbox"
import { EditableText } from "../form/editable_text/EditableText"
import { EditableTextSingleLine } from "../form/editable_text/EditableTextSingleLine"
import { get_today_str } from "../shared/utils/date_helpers"
import { is_defined } from "../shared/utils/is_defined"
import { KnowledgeView, knowledge_view_sort_types } from "../shared/wcomponent/interfaces/knowledge_view"
import type { NestedKnowledgeViewIdsMap } from "../state/derived/State"
import { FoundationKnowledgeViewsList } from "./FoundationKnowledgeViewsList"
import type { KnowledgeViewFormProps } from "./interfaces"
import { KnowledgeViewListsSet } from "./KnowledgeViewListsSet"



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



export const factory_get_kv_details = (props: KnowledgeViewFormProps) => (knowledge_view: KnowledgeView, on_change: (new_kv: KnowledgeView) => void) =>
{
    const { editing, nested_knowledge_view_ids } = props
    const nested_kv = nested_knowledge_view_ids.map[knowledge_view.id]
    const children = (nested_kv?.child_ids || []).map(id => props.knowledge_views_by_id[id])
        .filter(is_defined)

    return <div style={{ backgroundColor: "white", border: "thin solid #aaa", borderRadius: 3, padding: 5, margin: 5 }}>
        <p style={{ display: "inline-flex" }}>
            {editing && <span className="description_label">Title</span>} &nbsp;
            <EditableTextSingleLine
                placeholder="Title..."
                value={knowledge_view.title}
                conditional_on_blur={new_title => {
                    const default_title = knowledge_view.is_base ? "Base" : make_default_kv_title()
                    on_change({ ...knowledge_view, title: new_title || default_title })
                }}
            />
        </p>

        {(editing || knowledge_view.description) && <p>
            {editing && <span className="description_label">Description</span>} &nbsp;
            <EditableText
                placeholder="..."
                value={knowledge_view.description}
                conditional_on_blur={description => {
                    on_change({ ...knowledge_view, description })
                }}
            />
        </p>}


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


        {editing && <p>
            <span className="description_label">Sort status</span>
            <AutocompleteText
                selected_option_id={knowledge_view.sort_type}
                options={knowledge_view_sort_types.map(type => ({ id: type, title: type }))}
                allow_none={false}
                on_change={sort_type => sort_type && on_change({ ...knowledge_view, sort_type })}
            />
        </p>}


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
