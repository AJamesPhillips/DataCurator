import { h, FunctionComponent } from "preact"
import { useState, useCallback } from "preact/hooks"
import type { Dispatch } from "redux"
import { connect, ConnectedProps } from "react-redux"

import "./ObjectForm.css"
import { SelectPattern } from "../patterns/SelectPattern"
import { DeleteButton } from "../sharedf/DeleteButton"
import { ACTIONS } from "../state/actions"
import type { AddObjectProps, UpdateObjectProps } from "../state/objects/actions"
import { convert_from_pattern_attributes } from "../state/objects/objects"
import type { ObjectWithCache, PatternAttribute, Pattern, ObjectAttribute, RootState } from "../state/State"
import { LinkButton } from "../sharedf/Link"
import { EditableObjectAttributesList } from "./EditableObjectAttributesList"
import { object_content } from "./object_content"
import type { CreationContextState } from "../shared/creation_context/state"



type OwnProps = {
    object: ObjectWithCache | undefined
}


const map_state = (state: RootState) => ({
    creation_context: state.creation_context,
})


const map_dispatch = (dispatch: Dispatch) => ({
    add_object: (args: AddObjectProps, creation_context: CreationContextState) => {
        const action_add_object = ACTIONS.object.add_object(args, creation_context)
        dispatch(action_add_object)
        dispatch(ACTIONS.routing.change_route({
            route: "objects",
            item_id: action_add_object.id,
            sub_route: null,
            args: {},
        }))
    },
    update_object: (args: UpdateObjectProps) => dispatch(ACTIONS.object.update_object(args)),
    delete_object: (id: string) => dispatch(ACTIONS.object.delete_object(id)),
})


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



const blank_state: ObjectWithCache = {
    id: undefined as unknown as string,
    datetime_created: undefined as unknown as Date,
    pattern_id: "",
    pattern_name: "",
    content: "",

    attributes: [],
    labels: [],
    external_ids: {},

    rendered: "",
    is_rendered: false,
}


function _ObjectForm (props: Props)
{
    const initial_state: ObjectWithCache = props.object || blank_state
    const [object, set_object] = useState<ObjectWithCache>(initial_state)
    const [pattern_attributes, set_pattern_attributes] = useState<PatternAttribute[]>([])

    function update_object (args: Partial<ObjectWithCache>) { set_object({ ...object, ...args }) }

    if (props.object && props.object.id !== object.id) reset_form_data()
    if (!props.object && object.id !== undefined) reset_form_data()

    const set_pattern = useCallback((pattern: Pattern) => {
        update_object({
            pattern_id: pattern.id,
            content: pattern.content,
            attributes: convert_from_pattern_attributes(pattern.attributes),
        })

        set_pattern_attributes(pattern.attributes)
    }, [object])

    // const content_changed = useCallback((event: h.JSX.TargetedEvent<HTMLInputElement, Event>) => {
    //     set_object({ ...object, content: event.currentTarget.value })
    // }, [object])


    const change_attributes = useCallback((new_attributes: ObjectAttribute[]) => {
        set_object({ ...object, attributes: new_attributes })
    }, [object])

    function delete_attribute (index: number)
    {
        const new_attributes = object.attributes.filter((_, i) => i !== index )
        set_object({ ...object, attributes: new_attributes })
    }

    function upsert_object ()
    {
        props.object ? props.update_object(object) : props.add_object(object, props.creation_context)
    }

    function reset_form_data ()
    {
        set_object(initial_state)
        set_pattern_attributes([])
    }

    return <div>
        <b>{props.object ? "Edit object" : "Add object"}</b>

        <LinkButton
            route="objects"
            sub_route="objects_bulk_import"
            item_id={undefined}
            args={undefined}
            name="Bulk import"
            style={{ float: "right" }}
        />

        <hr />

        <div>
            <div class="field_label">Pattern:</div>
            <div class="field">
                {<SelectPattern
                    pattern_id={object.pattern_id}
                    disabled={!!props.object}
                    on_change_pattern={set_pattern}
                />}
            </div>
        </div>

        <hr />

        <EditableObjectAttributesList
            pattern_attributes={pattern_attributes}
            attributes={object.attributes}
            change_attributes={change_attributes}
            delete_attribute={delete_attribute}
        />

        <br />

        <input
            style={{ width: 400 }}
            type="text"
            placeholder="Object content"
            value={object.content}
            disabled={true} //!!props.object}
            // onChange={content_changed}
        ></input>

        <br/><br />

        <div>
            {object_content({ object: { ...object, rendered: "", is_rendered: false } })}
        </div>

        <br/><br />

        <input
            type="button"
            onClick={upsert_object}
            value={props.object ? "Update object" : "Add object"}
            disabled={initial_state === object} // This is a poor version of an "on changed" check
        ></input>

        <div style={{ float: "right" }}>
            <DeleteButton
                on_delete={() => props.delete_object(object.id) }
                is_large={true}
                disabled={!object.id}
            />
        </div>
    </div>
}


export const ObjectForm = connector(_ObjectForm) as FunctionComponent<OwnProps>
