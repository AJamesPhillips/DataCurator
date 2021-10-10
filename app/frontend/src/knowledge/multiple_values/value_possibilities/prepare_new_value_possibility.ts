import { v4 as uuid_v4 } from "uuid"

import type { ValuePossibilitiesById, ValuePossibility } from "../../../wcomponent/interfaces/possibility"
import { get_max_value_possibilities_order } from "./get_max_value_possibilities_order"



export function prepare_new_value_possibility (existing_value_possibilities: ValuePossibilitiesById | undefined): ValuePossibility
{
    const max_order = get_max_value_possibilities_order(existing_value_possibilities)

    return {
        id: uuid_v4(),
        value: "",
        description: "",
        order: max_order + 1,
    }
}
