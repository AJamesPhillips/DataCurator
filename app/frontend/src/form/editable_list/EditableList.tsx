import { useMemo, useState } from "preact/hooks"

import type { EditableListEntryItemProps, ListItemCRUDRequiredCU } from "./EditableListEntry"
import { ExpandableListWithAddButton } from "./ExpandableListWithAddButton"
import type { ExpandableListContentProps } from "./interfaces"
import { NewItemForm } from "./NewItemForm"
import { factory_render_list_content } from "./render_list_content"



interface EditableListProps <U>
{
    items: U[]
    item_descriptor: string
    get_id: (item: U) => string
    item_props: EditableListEntryItemProps<U, ListItemCRUDRequiredCU<U>>
    prepare_new_item: () => U

    disable_collapsed?: boolean
    disable_partial_collapsed?: boolean
}


export function EditableList <T> (props: EditableListProps<T>)
{
    const [new_item, set_new_item] = useState<T | undefined>(undefined)

    const { item_props } = props

    const render_list_content = factory_render_list_content({
        items: props.items,
        get_id: props.get_id,

        item_props,

        debug_item_descriptor: props.item_descriptor,
    })


    const modified_item_props = useMemo(() => ({
        ...item_props,
        crud: {
            ...item_props.crud,
            create_item: (new_item: T) =>
            {
                item_props.crud.create_item(new_item)
                set_new_item(undefined)
            },
        },
    }), [item_props])


    return <ExpandableListWithAddButton
        items_count={props.items.length}

        on_click_new_item={() => {
            const item = props.prepare_new_item()
            set_new_item(item)
        }}

        content={(list_content_props: ExpandableListContentProps) =>
        {
            return <div>
                <NewItemForm
                    new_item={new_item}
                    set_new_item={set_new_item}
                    item_props={modified_item_props}
                    item_descriptor={props.item_descriptor}
                />

                {render_list_content(list_content_props)}
            </div>
        }}

        {...props}
    />
}
