import { FunctionalComponent, h } from "preact"
import type { Dispatch } from "redux"
import { connect, ConnectedProps } from "react-redux"
import { DeleteButton } from "../sharedf/DeleteButton"

import type { Pattern } from "../state/State"
import { ACTIONS } from "../state/actions"
import { PatternAttributesList } from "./PatternAttributesList"
import { useState } from "preact/hooks"


interface OwnProps
{
    pattern: Pattern
}


const map_dispatch = (dispatch: Dispatch, props: OwnProps) =>
{
    return {
        update_pattern: (args: { name: string, content: string}) => {
            dispatch(ACTIONS.pattern.update_pattern({ id: props.pattern.id, ...args }))
        },
        delete_pattern: () => dispatch(ACTIONS.pattern.delete_pattern(props.pattern.id)),
    }
}

const connector = connect(null, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _EditPatternForm (props: Props)
{
    const [name, set_name] = useState(props.pattern.name)
    const [content, set_content] = useState(props.pattern.content)

    const changed = name !== props.pattern.name || content !== props.pattern.content

    return <div>
        <input
            type="text"
            placeholder="Pattern name"
            value={name}
            onChange={e => set_name(e.currentTarget.value)}
        ></input>

        <PatternAttributesList
            attributes={props.pattern.attributes}
            // change_attributes={change_attributes}
            // delete_attribute={delete_attribute}
        />

        <br />

        <input
            style={{ width: 400 }}
            type="text"
            placeholder="Pattern content"
            value={content}
            onChange={e => set_content(e.currentTarget.value)}
        ></input>

        <hr/>

        <input
            type="button"
            value="Update pattern"
            onClick={() => props.update_pattern({ name, content })}
            disabled={!changed}
        ></input>

        <div style={{ float: "right" }}>
            <DeleteButton
                on_delete={() => props.delete_pattern() }
                is_large={true}
            />
        </div>

    </div>
}


export const EditPatternForm = connector(_EditPatternForm) as FunctionalComponent<OwnProps>
