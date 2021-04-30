import { h } from "preact"

import { ExpandableList } from "./ExpandableList"
import type { ExpandableListContentProps } from "./interfaces"
import { ListHeaderAddButton } from "./ListHeaderAddButton"



export interface ExpandableListProps {
    content: (props: ExpandableListContentProps) => h.JSX.Element | null
    items_count?: number
    items_descriptor?: string
    item_descriptor: string
    new_item_descriptor?: string
    on_click_new_item: () => void
    disable_collapsed?: boolean
    disable_partial_collapsed?: boolean
}


export function ExpandableListWithAddButton (props: ExpandableListProps)
{
    const {
        items_count,
        item_descriptor,
        new_item_descriptor = item_descriptor,
    } = props

    return <ExpandableList
        header_content={() => <ListHeaderAddButton
            new_item_descriptor={new_item_descriptor}
            on_pointer_down_new_list_entry={props.on_click_new_item}
        />}
        content={props.content}
        items_count={items_count}
        items_descriptor={props.items_descriptor}
        item_descriptor={item_descriptor}
        disable_collapsed={props.disable_collapsed}
        disable_partial_collapsed={props.disable_partial_collapsed}
    />
}
