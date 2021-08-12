import { h } from "preact"

import "./ItemSearchWindow.css"
import type { Item } from "../state/State"
import { ITEM_FILTERS, ListOfTypes } from "./ListOfTypes"
import { useState } from "preact/hooks"
import { Modal } from "../modal/Modal"



interface OwnProps
{
    specific_type_id?: string
    filter_type: ITEM_FILTERS
    on_choose: (item: Item) => void
    on_close: () => void
}


export function ItemSearchWindow (props: OwnProps)
{
    const [search_string, set_search_string] = useState("")

    return <Modal
        on_close={props.on_close}
        title="Search"
        child={<div id="search_container">
            <input
                type="text"
                value={search_string}
                onChange={e => set_search_string(e.currentTarget.value)}
                ref={focus_search_box}
            />

            <br />
            <br />
            <hr />

            <ListOfTypes
                specific_type_id={props.specific_type_id}
                filter_type={props.filter_type}
                filtered_by_string={search_string}
                on_click={(item: Item) => props.on_choose(item)}
            />
        </div>}
    />
}


function focus_search_box (el: HTMLInputElement | null)
{
    if (el) el.focus()
}
