import { useRef } from "preact/hooks"

import { WComponentSearchWindow } from "../../search/WComponentSearchWindow"
import "../Editable.css"



export interface OnFocusSetSelection
{
    start: number
    end: number
}



interface OwnProps
{
    value: string
    id_insertion_point: number
    conditional_on_change: (args: { new_value: string, on_focus_set_selection: OnFocusSetSelection }) => void
    on_close: (on_focus_set_selection: OnFocusSetSelection) => void
}
// TODO rename this component.  It is not so much a conditional change wcomponent search window as a
// search window that modifies the text field it is connected to, and also selects parts of the text
// once the user has selected an appropriate component to link to
export function ConditionalWComponentSearchWindow (props: OwnProps)
{
    const {
        value, id_insertion_point,
        conditional_on_change, on_close
    } = props


    const initial_search_term = get_initial_search_term({ value, id_insertion_point })
    const has_inserted_id = useRef(false)


    return <WComponentSearchWindow
        initial_search_term={initial_search_term}
        on_change={id_to_insert =>
        {
            const new_value = insert_id_into_text({
                value,
                id_to_insert,
                id_insertion_point,
            })

            const end_of_inserted_id = id_insertion_point + (id_to_insert?.length || 0)
            const end_of_search_term = end_of_inserted_id + (initial_search_term?.length || 0)

            const on_focus_set_selection: OnFocusSetSelection = { start: end_of_inserted_id, end: end_of_search_term }
            has_inserted_id.current = true
            conditional_on_change({ new_value, on_focus_set_selection })
        }}
        on_blur={() =>
        {
            if (has_inserted_id.current) return

            const end_of_search_term = id_insertion_point + (initial_search_term?.length || 0)
            const on_focus_set_selection: OnFocusSetSelection = { start: id_insertion_point, end: end_of_search_term }
            on_close(on_focus_set_selection)
        }}
    />
}



interface GetInitialSearchTermArgs
{
    value: string
    id_insertion_point: number
}
function get_initial_search_term (args: GetInitialSearchTermArgs)
{
    const text_after_insertion_point = args.value.slice(args.id_insertion_point)

    const search_term_match = text_after_insertion_point.match(/^(\w+)/)

    return search_term_match ? (search_term_match[1] || "") : ""
}



interface InsertIdIntoTextArgs
{
    value: string
    id_to_insert: string | undefined
    id_insertion_point: number
}
function insert_id_into_text (args: InsertIdIntoTextArgs)
{
    const { value, id_to_insert, id_insertion_point } = args

    if (id_to_insert === undefined) return value

    return value.slice(0, id_insertion_point) + id_to_insert + value.slice(id_insertion_point)
}
