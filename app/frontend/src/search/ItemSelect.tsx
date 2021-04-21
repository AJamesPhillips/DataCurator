import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import "./ItemSelect.css"
import type { Item, RootState } from "../state/State"
import { get_id_map } from "../utils/get_id_map"
import { description } from "../utils/item"
import { ItemSearchWindow } from "./ItemSearchWindow"
import type { ITEM_FILTERS } from "./ListOfTypes"


type OwnProps =
{
    editable: false
    item_id: string
    filter: ITEM_FILTERS
    placeholder?: string
} | {
    editable: true
    item_id: string
    filter: ITEM_FILTERS
    filter_specific_type_id?: string
    placeholder?: string
    on_change_item_id?: (id: string) => void
    on_change_item?: (item: Item) => void
}


const map_state = (state: RootState, own_props: OwnProps) => {

    const ids = [own_props.item_id]
    const id_map = get_id_map(ids, state)

    return { id_map }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


const placeholder_map = {
    "simple_types": "Statement Type",
    "types": "Statement Type or Pattern",
    "patterns": "Pattern",
    "all_concrete": "All instances",
}


function _ItemSelect (props: Props)
{
    let item_id_css_class = "empty"
    const placeholder = props.placeholder || placeholder_map[props.filter]
    let item_id_desc: string | h.JSX.Element | undefined = undefined

    if (props.item_id)
    {
        item_id_css_class = ""
        const item = props.id_map[props.item_id]
        item_id_desc = item ? description(item) : props.item_id
    }

    if (!props.editable)
    {
        return <div class={"fake_text_input disabled " + item_id_css_class}>
            {item_id_desc || ""}
        </div>
    }

    const [display_search, set_display_search] = useState(false)

    return <div>
        <div
            class={"fake_text_input " + item_id_css_class}
            onClick={() => set_display_search(true)}
        >
            {item_id_desc || placeholder}
        </div>

        {display_search && <ItemSearchWindow
            specific_type_id={props.filter_specific_type_id}
            filter_type={props.filter}
            on_choose={(item: Item) => {
                props.on_change_item_id && props.on_change_item_id(item.id)
                props.on_change_item && props.on_change_item(item)
                set_display_search(false)
            }}
            on_close={() => set_display_search(false)}
        />}
    </div>
}


export const ItemSelect = connector(_ItemSelect) as FunctionalComponent<OwnProps>
