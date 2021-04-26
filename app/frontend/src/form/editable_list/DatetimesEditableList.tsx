// import { h } from "preact"
// import { connect, ConnectedProps } from "react-redux"

// import type { RootState } from "../../state/State"
// import { EditableList, EditableListProps } from "./EditableList"



// type OwnProps<U> = EditableListProps<U>


// const map_state = (state: RootState) => ({
//     datetime_ms: state.routing.args.created_at_ms,
// })


// const connector = connect(map_state)
// type Props<T> = ConnectedProps<typeof connector> & OwnProps<T>



// function _DatetimesEditableList <T> (props: OwnProps<T>)
// {
//     // const class_name__display = editing_new_item ? "" :
//     // (created_datetime_ms > datetime_ms
//     //     ? " in_future "
//     //     : (created_datetime_ms === datetime_ms ? " focused " : ""))

//     const { future_items, past_items } = split_items_by_datetimes({ items: props.items, })

//     return <EditableList
//         {...props}
//     />
// }



// const _DatetimesEditableList2 = connector(_DatetimesEditableList)
// export function DatetimesEditableList<T> (own_props: OwnProps<T>)
// {
//     return <_DatetimesEditableList2 {...own_props}/>
// }
