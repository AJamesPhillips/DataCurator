import { h } from "preact"

import "./SearchWindow.css"
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
        child={() => {

            const id_search_box = "search_box"
            setTimeout(() => focus_search_box(id_search_box), 0)

            return <div id="search_container">
                <input
                    id={id_search_box}
                    type="text"
                    value={search_string}
                    onChange={e => set_search_string(e.currentTarget.value)}
                ></input>

                <br />
                <br />
                <hr />

                <ListOfTypes
                    specific_type_id={props.specific_type_id}
                    filter_type={props.filter_type}
                    filtered_by_string={search_string}
                    on_click={(item: Item) => props.on_choose(item)}
                />
            </div>
        }}
    />
}


function focus_search_box (html_id: string)
{
    const el = document.getElementById(html_id)
    if (el) el.focus()
}
