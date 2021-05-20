import { FunctionComponent, h } from "preact"
import { useState, useCallback } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { LabelsList } from "../labels/LabelsList"
import { ItemSelect } from "../search/ItemSelect"
import type { CreationContextState } from "../shared/interfaces"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"



interface OwnProps {}


const map_state = (state: RootState) => ({
    creation_context: state.creation_context,
})

const map_dispatch = {
    add_statement: (content: string, labels: string[], creation_context: CreationContextState) => ACTIONS.statement.add_statement({ content, labels }, creation_context)
}


const connector = connect(map_state, map_dispatch)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & {}


function _NewStatementForm (props: Props)
{
    const [content, set_content] = useState("")
    const [labels, set_labels] = useState<string[]>([])

    const content_changed = useCallback((event: h.JSX.TargetedEvent<HTMLInputElement, Event>) => {
        set_content(event.currentTarget.value)
    }, [content])

    function add_label (id: string)
    {
        if (labels.includes(id)) return
        set_labels([...labels, id])
    }

    function add_statement ()
    {
        props.add_statement(content, labels, props.creation_context)
        set_content("")
        set_labels([])
    }

    return <div>
        Statement content:
        <br />
        <input
            placeholder="Statement content"
            value={content}
            onChange={content_changed}
            onKeyDown={e => e.key === "Enter" && add_statement()}
        ></input>

        <br />
        <br />
        Labels:
        <ItemSelect
            editable={true}
            item_id=""
            filter="simple_types"
            on_change_item_id={add_label}
        />
        <LabelsList labels={labels}/>

        <br />
        <br />

        <input
            type="button"
            onClick={add_statement}
            value="Add statement"
            disabled={!content}
        ></input>
    </div>
}


export const NewStatementForm = connector(_NewStatementForm) as FunctionComponent<OwnProps>
