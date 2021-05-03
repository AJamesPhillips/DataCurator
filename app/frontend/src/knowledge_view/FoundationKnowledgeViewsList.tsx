import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutoCompleteOption, AutocompleteText } from "../form/AutocompleteText"
import type { KnowledgeView } from "../shared/models/interfaces/SpecialisedObjects"
import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { remove_from_list_by_predicate } from "../utils/list"



interface OwnProps {
    owner_knowledge_view: KnowledgeView
    on_change: (foundation_knowledge_view_ids: string[]) => void
}


const map_state = (state: RootState) => ({
    knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
    knowledge_views: state.specialised_objects.knowledge_views,
})

const map_dispatch = {
    upsert_knowledge_view: ACTIONS.specialised_object.upsert_knowledge_view,
}

const connector = connect(map_state, map_dispatch)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _FoundationKnowledgeViewsList (props: Props)
{
    const { owner_knowledge_view, knowledge_views_by_id, knowledge_views, on_change } = props

    const foundation_knowledge_view_ids: string[] = owner_knowledge_view.foundation_knowledge_view_ids || []
    const foundation_knowledge_views = foundation_knowledge_view_ids.map(id => knowledge_views_by_id[id])


    const get_options = () =>
    {
        const options: AutoCompleteOption[] = knowledge_views
            .filter(({ id }) => id !== owner_knowledge_view.id)
            .map(({ id, title }) => ({ id, title }))
            .sort((kv1, kv2) => kv1.title < kv2.title ? -1 : 1)

        return options
    }


    const total = foundation_knowledge_views.length

    return <div>
        Foundational Knowledge Views ({total})

        <AutocompleteText
            placeholder="Search for knowledge view to add..."
            selected_option_id={undefined}
            get_options={get_options}
            on_change={id =>
            {
                if (!id) return
                on_change([id, ...foundation_knowledge_view_ids])
            }}
        />


        {foundation_knowledge_views.map((foundation_knowledge_view, index) =>
        {
            return <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ flex: "1" }}>{total - index}</div>
                <div style={{ flex: "9" }}>{foundation_knowledge_view.title}</div>
                <div style={{ flex: "3" }}>
                    <Button
                        value="remove"
                        on_pointer_down={() =>
                        {
                            on_change(remove_from_list_by_predicate(foundation_knowledge_view_ids, id => id === foundation_knowledge_view.id))
                        }}
                    />
                </div>
            </div>
        })}
    </div>
}

export const FoundationKnowledgeViewsList = connector(_FoundationKnowledgeViewsList) as FunctionComponent<OwnProps>
