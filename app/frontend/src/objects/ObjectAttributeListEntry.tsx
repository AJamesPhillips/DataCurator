import { FunctionComponent, h } from "preact"
import { connect } from "react-redux"

import { is_id_attribute, is_value_attribute, Item, ObjectAttribute, RootState } from "../state/State"
import { get_id_map } from "../utils/get_id_map"
import { ItemSelect } from "../search/ItemSelect"
import { CORE_IDS } from "../state/core_data"


interface StateProps {
    id_map: { [id: string]: Item }
}

type OwnProps = {
    attribute: ObjectAttribute
    on_change: (attribute: ObjectAttribute) => void
    editable: true
    editable_type: boolean
} | {
    attribute: ObjectAttribute
    editable: false
    editable_type?: false
}

type Props = StateProps & OwnProps


const map_state = (state: RootState, own_props: OwnProps): StateProps => {

    const ids: string[] = []  // [own_props.attribute.type_id]
    const id_map = get_id_map(ids, state)

    return { id_map }
}


function _ObjectAttributeListEntry (props: Props)
{
    const attribute = props.attribute

    function on_change_id (id: string)
    {
        if (props.editable)
        {
            const changed_attribute = { ...props.attribute, id }
            delete (changed_attribute as any).value
            props.on_change(changed_attribute)
        }
    }

    function on_change_value (value: string)
    {
        if (props.editable)
        {
            const changed_attribute = { ...props.attribute, value }
            delete (changed_attribute as any).id
            props.on_change(changed_attribute)
        }
    }

    return [
        <td>
            <ItemSelect
                editable={!!props.editable_type}
                item_id={attribute.pattern.type_id}
                filter="types" // TODO deprecate in favour of `filter_specific_type_id` by CORE_IDS.sType
                filter_specific_type_id={CORE_IDS.sType}
            />
        </td>,
        <td>
            {attribute.pattern.alt_name}
        </td>,
        <td>
            <ItemSelect
                editable={props.editable && (is_id_attribute(attribute) || !attribute.value)}
                item_id={(is_id_attribute(attribute) && attribute.id) || ""}
                filter="all_concrete"
                filter_specific_type_id={attribute.pattern.type_id}
                on_change_item_id={on_change_id}
            />
        </td>,
        <td>
            <input
                disabled={!(props.editable && (is_value_attribute(attribute) || !attribute.id))}
                value={(is_value_attribute(attribute) && attribute.value) || ""}
                onChange={e => on_change_value(e.currentTarget.value)}
                placeholder="Value"
            />
        </td>,
    ]
}

const connector = connect(map_state)
export const ObjectAttributeListEntry = connector(_ObjectAttributeListEntry) as FunctionComponent<OwnProps>
