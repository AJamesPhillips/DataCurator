import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../form/AutocompleteText"
import type { KnowledgeView } from "../shared/models/interfaces/SpecialisedObjects"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"



interface OwnProps {
    owner_knowledge_view: KnowledgeView
    on_change: (foundation_knowledge_view_ids: string[]) => void
}


const map_state = (state: RootState) => ({
    knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
})

const map_dispatch = {
    upsert_knowledge_view: ACTIONS.specialised_object.upsert_knowledge_view,
}

const connector = connect(map_state, map_dispatch)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _FoundationKnowledgeViewsList (props: Props)
{
    const { owner_knowledge_view, knowledge_views_by_id } = props

    const foundation_knowledge_view_ids: string[] = owner_knowledge_view.foundation_knowledge_view_ids || []
    const foundation_knowledge_views = foundation_knowledge_view_ids.map(id => knowledge_views_by_id[id])


    const get_options = () =>
    {
        return []
    }


    const total = foundation_knowledge_views.length

    return <div>
        Foundational Knowledge Views ({total})

        <AutocompleteText
            placeholder="Search for knowledge view to add..."
            selected_option_id={undefined}
            get_options={get_options}
            on_change={() => {}}
        />


        {foundation_knowledge_views.map((foundation_knowledge_view, index) =>
        {
            return <div>
                <div>{total - index}</div>
                <div>{foundation_knowledge_view.title}</div>
            </div>
        })}
    </div>
}

export const FoundationKnowledgeViewsList = connector(_FoundationKnowledgeViewsList) as FunctionComponent<OwnProps>
