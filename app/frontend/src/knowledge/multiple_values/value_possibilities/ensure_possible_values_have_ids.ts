import { v4 as uuid_v4 } from "uuid"

import type { SimpleValuePossibility, ValuePossibility } from "../../../shared/wcomponent/interfaces/possibility"
import { get_max_value_possibilities_order } from "./get_max_value_possibilities_order"



export function ensure_possible_values_have_ids (simple_possibilities: SimpleValuePossibility[]): ValuePossibility[]
{
    let max_order = get_max_value_possibilities_order(simple_possibilities)

    // Ensure all possibilities have an id, order and description
    const possibilities: ValuePossibility[] = simple_possibilities.map(possibility =>
    {
        const id = possibility.id || uuid_v4()
        const order = possibility.order ?? ++max_order
        return { description: "", ...possibility, id, order }
    })

    return possibilities
}
