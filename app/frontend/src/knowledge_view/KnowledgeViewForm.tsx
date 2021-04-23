import { FunctionComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import { create_new_knowledge_view } from "./create_new_knowledge_view"



interface OwnProps {}


const map_dispatch = {
    upsert_knowledge_view: ACTIONS.specialised_object.upsert_knowledge_view,
}

const connector = connect(null, map_dispatch)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _KnowledgeViewForm (props: Props)
{
    const [new_knowledge_view_title, set_new_knowledge_view_title] = useState("")

    function create_knowledge_view ()
    {
        const knowledge_view = create_new_knowledge_view({ title: new_knowledge_view_title })
        props.upsert_knowledge_view({ knowledge_view })
        set_new_knowledge_view_title("")
    }

    return <div>
        <input
            type="text"
            value={new_knowledge_view_title}
            onChange={e => set_new_knowledge_view_title(e.currentTarget.value)}
        />

        <Button
            value="Create Knowledge View"
            extra_class_names="left"
            size="normal"
            disabled={!new_knowledge_view_title}
            on_pointer_down={() => create_knowledge_view()}
        />
    </div>
}


export const KnowledgeViewForm = connector(_KnowledgeViewForm) as FunctionComponent<OwnProps>
