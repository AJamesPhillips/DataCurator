import { BaseModel } from "../../../shared/models/base"
import { dispatch } from "../../../app/shared/state/store"

export function reset_store() {
    dispatch({ type: "RESET" })
}

/**
 * Convert to string to simulate response from server
 */
export function JSON_date_to_string<T extends BaseModel>(model: T): T {

    // tslint:disable-next-line
    model.created_at = (model.created_at.toString() as any)
    // tslint:disable-next-line
    model.modified_at = (model.modified_at!.toString() as any)
    return model
}
