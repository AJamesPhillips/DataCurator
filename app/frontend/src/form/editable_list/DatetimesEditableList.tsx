// import { h } from "preact"
// import { useState } from "preact/hooks"

// import { Button } from "../../sharedf/Button"
// import { remove_index, upsert_entry } from "../../utils/list"
// import { EditableListEntry } from "./EditableListEntry"



// interface OwnProps<U> {
//     items: U[]
//     item_descriptor: string
//     get_id: (item: U) => string
//     get_created_at: (item: U) => Date
//     get_custom_created_at?: (item: U) => Date | undefined
//     set_custom_created_at?: (item: U, new_custom_created_at: Date | undefined) => U
//     get_summary: (item: U, on_change: (item: U) => void, editing_new_item: boolean) => h.JSX.Element
//     get_details: (item: U, on_change: (item: U) => void, editing_new_item: boolean) => h.JSX.Element
//     get_details2?: (item: U, on_change: (item: U) => void, editing_new_item: boolean) => h.JSX.Element
//     prepare_new_item: () => U
//     update_items: (items: U[]) => void
//     entries_extra_class_names?: string
//     disable_collapsed?: boolean
//     disable_partial_collapsed?: boolean
// }




// const map_state = (state: RootState) => ({
//     datetime_ms: state.routing.args.created_at_ms,
// })



// const connector = connect(map_state)
// type Props<T> = ConnectedProps<typeof connector> & OwnProps<T>



// function _DatetimesEditableList <T> (props: OwnProps<T>)
// {
//     const class_name__display = editing_new_item ? "" :
//     (created_datetime_ms > datetime_ms
//         ? " in_future "
//         : (created_datetime_ms === datetime_ms ? " focused " : ""))
// }



// const _DatetimesEditableList2 = connector(_DatetimesEditableList)
// export function DatetimesEditableList<T> (own_props: OwnProps<T>)
// {
//     return <_DatetimesEditableList2 {...own_props}/>
// }
