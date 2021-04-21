import { h } from "preact"

import type { ObjectAttribute, PatternAttribute } from "../state/State"
import { DeleteButton } from "../sharedf/DeleteButton"
import { ObjectAttributeListEntry } from "./ObjectAttributeListEntry"

interface OwnProps {
    pattern_attributes: PatternAttribute[]
    attributes: ObjectAttribute[]
    change_attributes: (new_attributes: ObjectAttribute[]) => void
    delete_attribute: (index: number) => void
}


function _EditableObjectAttributesList (props: OwnProps)
{

    const change_attribute = (index: number) => (attribute: ObjectAttribute) =>
    {
        const new_attributes = [...props.attributes]
        new_attributes[index] = attribute
        props.change_attributes(new_attributes)
    }

    return <div>
        <table class="list no_border padded">
            {props.attributes.map((attribute, i) => <tr> {/* TODO set key */}
                <ObjectAttributeListEntry
                    attribute={attribute}
                    on_change={change_attribute(i)}
                    editable={true}
                    editable_type={false}
                />
            </tr>)}
        </table>
    </div>
}


export const EditableObjectAttributesList = _EditableObjectAttributesList
