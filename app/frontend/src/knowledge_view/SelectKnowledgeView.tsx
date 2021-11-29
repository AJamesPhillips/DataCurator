import { FunctionComponent, h } from "preact"
import { useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import type { AutocompleteOption } from "../form/Autocomplete/interfaces"
import type { KnowledgeView } from "../shared/interfaces/knowledge_view"
import type { RootState } from "../state/State"



interface OwnProps {
    placeholder?: string
    selected_option_id?: string | undefined
    allowed_ids?: Set<string>
    exclude_ids?: Set<string>
    on_change: (knowledge_view_id: string | undefined) => void
    force_editable?: boolean
}


const map_state = (state: RootState) => ({
    knowledge_views: state.derived.knowledge_views,
    nested_knowledge_view_ids_map: state.derived.nested_knowledge_view_ids.map,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _SelectKnowledgeView (props: Props)
{
    const {
        placeholder,
        selected_option_id = undefined,
        allowed_ids,
        exclude_ids = new Set(),
        on_change,
        knowledge_views,
        nested_knowledge_view_ids_map,
    } = props


    const options: AutocompleteOption[] = useMemo(() =>
    {
        const filtered_knowledge_views = filter_knowledge_views(knowledge_views, allowed_ids, exclude_ids)

        return filtered_knowledge_views.map(({ id, title }) =>
        {
            let subtitle = ""
            let entry = nested_knowledge_view_ids_map[id]
            while (entry)
            {
                subtitle = " / " + entry.title + subtitle
                entry = nested_knowledge_view_ids_map[entry?.parent_id || ""]
            }

            return { id, title, subtitle }
        })
        .sort((kv1, kv2) => kv1.title < kv2.title ? -1 : 1)
    }
    , [knowledge_views, allowed_ids, exclude_ids, nested_knowledge_view_ids_map])


    return <AutocompleteText
        placeholder={placeholder || "Select knowledge view..."}
        allow_none={true}
        selected_option_id={selected_option_id}
        options={options}
        on_change={on_change}
        force_editable={props.force_editable}
    />
}

export const SelectKnowledgeView = connector(_SelectKnowledgeView) as FunctionComponent<OwnProps>



function filter_knowledge_views (knowledge_views: KnowledgeView[], allowed_ids: Set<string> | undefined, exclude_ids: Set<string>)
{
    let filtered_knowledge_views = knowledge_views
    if (allowed_ids)
    {
        filtered_knowledge_views = filtered_knowledge_views.filter(({ id }) => allowed_ids.has(id))
    }

    if (exclude_ids.size)
    {
        filtered_knowledge_views = filtered_knowledge_views.filter(({ id }) => !exclude_ids.has(id))
    }

    return filtered_knowledge_views
}
