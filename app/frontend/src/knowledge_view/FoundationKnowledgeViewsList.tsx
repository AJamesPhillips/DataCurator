import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { KnowledgeView } from "../shared/wcomponent/interfaces/knowledge_view"
import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { remove_from_list_by_predicate } from "../utils/list"
import { SelectKnowledgeView } from "./SelectKnowledgeView"



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
    const { owner_knowledge_view, knowledge_views_by_id, on_change } = props

    const foundation_knowledge_view_ids = owner_knowledge_view.foundation_knowledge_view_ids || []
    const foundation_knowledge_view_ids_set = new Set(foundation_knowledge_view_ids)

    const foundation_knowledge_views: KnowledgeView[] = []
    const unfound_ids: string[] = []
    foundation_knowledge_view_ids.forEach(id =>
    {
        const kv = knowledge_views_by_id[id]
        if (kv) foundation_knowledge_views.push(kv)
        // knowledge view may have been deleted in the intervening time
        else unfound_ids.push(id)
    })

    if (unfound_ids.length) console.warn(`Unfounded foundational knowledge view ids: ${unfound_ids.join(", ")}`)


    const exclude_ids = new Set(foundation_knowledge_view_ids_set)
    exclude_ids.add(owner_knowledge_view.id)


    const total = foundation_knowledge_views.length

    return <div>
        Foundational Knowledge Views ({total})

        <SelectKnowledgeView
            placeholder="Search for knowledge view to add..."
            exclude_ids={exclude_ids}
            on_change={id =>
            {
                if (!id) return
                on_change([id, ...foundation_knowledge_view_ids])
            }}
        />


        {foundation_knowledge_views.map((foundation_knowledge_view, index) =>
        {
            return <div style={{ display: "flex", flexDirection: "row" }} key={foundation_knowledge_view.id}>
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

        {unfound_ids.length && <div>Could not find {unfound_ids.length} knowledge views</div>}
    </div>
}

export const FoundationKnowledgeViewsList = connector(_FoundationKnowledgeViewsList) as FunctionComponent<OwnProps>
