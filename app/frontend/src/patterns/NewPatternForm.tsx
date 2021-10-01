import { h, FunctionComponent } from "preact"
import { useState, useCallback } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { ItemSelect } from "../search/ItemSelect"
import type { Pattern, PatternAttribute, RootState } from "../state/State"
import { ACTIONS } from "../state/actions"
import { EditablePatternAttributesList } from "./EditablePatternAttributesList"
import type { CreationContextState } from "../shared/creation_context/state"



interface OwnProps {}


const map_state = (state: RootState) => ({
    creation_context: state.creation_context,
})

const map_dispatch = {
    add_pattern: (args: { name: string, content: string, attributes: PatternAttribute[] }, creation_context: CreationContextState) => ACTIONS.pattern.add_pattern(args, creation_context)
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _NewPatternForm (props: Props)
{
    const [name, set_name] = useState("")
    const name_changed = useCallback((event: h.JSX.TargetedEvent<HTMLInputElement, Event>) => {
        set_name(event.currentTarget.value)
    }, [name])

    const [content, set_content] = useState("")
    const content_changed = (event: h.JSX.TargetedEvent<HTMLInputElement, Event>) => {
        set_content(event.currentTarget.value)
    }

    const [attributes, set_attributes] = useState<PatternAttribute[]>([])

    const change_attributes = useCallback((new_attributes: PatternAttribute[]) => {
        set_attributes(new_attributes)
    }, [attributes])

    const delete_attribute = useCallback((index: number) => {
        const new_attributes = attributes.filter((_, i) => i !== index )
        set_attributes(new_attributes)
    }, [attributes])


    function on_change_clone_pattern (pattern: Pattern)
    {
        set_name(pattern.name)
        set_content(pattern.content)
        set_attributes(pattern.attributes)
    }


    function add_pattern ()
    {
        props.add_pattern({ name, content, attributes }, props.creation_context)
        set_content("")
        set_attributes([])
    }

    return <div>
        <input
            type="text"
            placeholder="Pattern name"
            value={name}
            onChange={name_changed}
        ></input>

        <br /><br />

        <EditablePatternAttributesList
            attributes={attributes}
            change_attributes={change_attributes}
            delete_attribute={delete_attribute}
        />

        <br />

        <input
            style={{ width: 400 }}
            type="text"
            placeholder="Pattern content"
            value={content}
            onChange={content_changed}
        ></input>

        <br/><br />

        <input
            type="button"
            onClick={add_pattern}
            value="Add pattern"
            disabled={!name}
        ></input>

        <div style={{ float: "right" }}>
            <ItemSelect
                editable={true}
                item_id={""}
                filter="patterns"
                placeholder="Clone pattern"
                on_change_item={pattern => on_change_clone_pattern(pattern as Pattern)}
            />
        </div>
    </div>
}


export const NewPatternForm = connector(_NewPatternForm) as FunctionComponent<OwnProps>
