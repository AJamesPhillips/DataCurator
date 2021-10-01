import { h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { PatternAttribute, RootState } from "../state/State"
import { DeleteButton } from "../sharedf/DeleteButton"
import { PatternAttributeListEntry, PatternAttributeListHeader } from "./PatternAttributeListEntry"


// const map_state = (state: RootState) => ({
//     // attributes: state.
// })

// const map_dispatch = {
//     // delete_pattern: (id: string) => ACTIONS.pattern.delete_pattern(id)
// }


// const connector = connect(map_state, map_dispatch)
// type Props = ConnectedProps<typeof connector> & OwnProps

type Props = /*PropsFromRedux &*/ {
    attributes: PatternAttribute[]
    change_attributes: (new_attributes: PatternAttribute[]) => void
    delete_attribute: (index: number) => void
}


function _EditablePatternAttributesList (props: Props)
{

    function add_attribute ()
    {
        const new_blank_attribute: PatternAttribute = {
            type_id: "",
            alt_name: "",
        }
        props.change_attributes([...props.attributes, new_blank_attribute])
    }

    const change_attribute = (index: number) => (attribute: PatternAttribute) =>
    {
        const new_attributes = [...props.attributes]
        new_attributes[index] = attribute
        props.change_attributes(new_attributes)
    }

    return <div>
        <table>
            {!!props.attributes.length && <PatternAttributeListHeader />}
            {props.attributes.map((attribute, i) => <tr> {/* TODO set key */}
                <PatternAttributeListEntry attribute={attribute} on_change={change_attribute(i)} editable={true} />
                <td>
                    <DeleteButton on_delete={() => props.delete_attribute(i) } />
                </td>
            </tr>)}
        </table>
        <input type="button" value="Add attribute" onClick={add_attribute} />
    </div>
}


export const EditablePatternAttributesList = _EditablePatternAttributesList // connector(_EditablePatternAttributesList)
