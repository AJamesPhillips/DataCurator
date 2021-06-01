import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../../state/State"
import type { ExpandableListContentProps } from "./interfaces"
import { ListHeader } from "./ListHeader"



export interface ExpandableList2Props {
    header_content?: () => h.JSX.Element | null
    content: (props: ExpandableListContentProps) => h.JSX.Element | null
    items_count?: number
    items_descriptor?: string
    item_descriptor: string
    disable_collapsed?: boolean
    disable_partial_collapsed?: boolean
}



const map_state = (state: RootState) => ({
    editing: !state.display.consumption_formatting,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & ExpandableList2Props


function _ExpandableList (props: Props)
{
    const expanded_initial_state = props.disable_collapsed
        ? (props.disable_partial_collapsed ? ExpandedListStates.expanded : ExpandedListStates.partial_expansion)
        : ExpandedListStates.collapsed
    const [expanded_items, set_expanded_items] = useState(expanded_initial_state)

    const expanded_item_rows = expanded_items === ExpandedListStates.expanded

    const {
        header_content = () => null,
        content,
        items_count,
        item_descriptor,
        items_descriptor = get_items_descriptor(item_descriptor, items_count, props.editing),
        disable_partial_collapsed = false,
    } = props


    function toggle_expansion ()
    {
        let new_expansion = (expanded_items + 1) % 3
        if (props.disable_collapsed && new_expansion === ExpandedListStates.collapsed) ++new_expansion
        if (disable_partial_collapsed && new_expansion === ExpandedListStates.partial_expansion) ++new_expansion
        set_expanded_items(new_expansion)
    }


    return <div>
        <ListHeader
            items_descriptor={items_descriptor}
            on_click_header={toggle_expansion}
            other_content={header_content}
        />

        {content({ disable_partial_collapsed, expanded_items: expanded_items > 0, expanded_item_rows })}
    </div>
}

export const ExpandableList = connector(_ExpandableList) as FunctionalComponent<ExpandableList2Props>



enum ExpandedListStates {
    collapsed = 0,
    partial_expansion = 1,
    expanded = 2,
}



export function get_items_descriptor (item_descriptor: string, items_count: number | undefined, editing: boolean = true)
{
    if (editing || (items_count !== undefined && items_count !== 0))
    {
        item_descriptor += ` (${items_count})`
    }

    return item_descriptor
}
