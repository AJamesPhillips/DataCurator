import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import type { AutocompleteOption } from "../form/Autocomplete/interfaces"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"



interface OwnProps {
    placeholder?: string
    selected_option_id?: string | undefined
    exclude_ids?: Set<string>
    on_change: (knowledge_view_id: string | undefined) => void
}


const map_state = (state: RootState) => ({
    knowledge_views: state.derived.knowledge_views,
    nested_knowledge_view_ids_map: state.derived.nested_knowledge_view_ids.map,
})

const map_dispatch = {
    upsert_knowledge_view: ACTIONS.specialised_object.upsert_knowledge_view,
}

const connector = connect(map_state, map_dispatch)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _SelectKnowledgeView (props: Props)
{
    const {
        placeholder,
        selected_option_id = undefined,
        exclude_ids = new Set(),
        on_change,
        knowledge_views,
        nested_knowledge_view_ids_map,
    } = props


    const options: AutocompleteOption[] = knowledge_views
        .filter(({ id }) => !exclude_ids.has(id))
        .map(({ id, title }) =>
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


    return <AutocompleteText
        placeholder={placeholder || "Select knowledge view..."}
        allow_none={true}
        selected_option_id={selected_option_id}
        options={options}
        on_change={on_change}
    />
}

export const SelectKnowledgeView = connector(_SelectKnowledgeView) as FunctionComponent<OwnProps>
