import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutoCompleteOption, AutocompleteText } from "../form/AutocompleteText"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"



interface OwnProps {
    placeholder?: string
    selected_option_id?: string | undefined
    exclude_ids?: Set<string>
    on_change: (knowledge_view_id: string | undefined) => void
}


const map_state = (state: RootState) => ({
    knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
    knowledge_views: state.derived.knowledge_views,
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
    } = props


    const get_options = () =>
    {
        const options: AutoCompleteOption[] = knowledge_views
            .filter(({ id }) => !exclude_ids.has(id))
            .map(({ id, title }) => ({ id, title }))
            .sort((kv1, kv2) => kv1.title < kv2.title ? -1 : 1)

        return options
    }

    return <AutocompleteText
        placeholder={placeholder || "Select knowledge view..."}
        selected_option_id={selected_option_id}
        get_options={get_options}
        on_change={on_change}
    />
}

export const SelectKnowledgeView = connector(_SelectKnowledgeView) as FunctionComponent<OwnProps>
