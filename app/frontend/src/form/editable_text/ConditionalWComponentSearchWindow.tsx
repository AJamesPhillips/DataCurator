import { h } from "preact"
import type { Ref } from "preact/hooks"

import "../Editable.css"
import { WComponentSearchWindow } from "../../search/WComponentSearchWindow"



interface OwnProps
{
    value: string
    id_insertion_point: number
    on_focus_set_selection: Ref<[number, number] | undefined>
    conditional_on_change: (new_value: string) => void
}
// TODO rename this component.  It is not so much a conditional change wcomponent search window as a
// search window that modifies the text field it is connected to, and also selects parts of the text
// once the user has selected an appropriate component to link to
export function ConditionalWComponentSearchWindow (props: OwnProps)
{
    const {
        value, id_insertion_point, on_focus_set_selection,
        conditional_on_change,
    } = props


    const initial_search_term = get_initial_search_term({ value, id_insertion_point })


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

            on_focus_set_selection.current = [end_of_inserted_id, end_of_search_term]
            conditional_on_change(new_value)
        }}
        on_blur={() => {}}
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

    return search_term_match ? search_term_match[1] : ""
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