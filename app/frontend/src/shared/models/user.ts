import {
    BaseModel,
    from_pojo as base_from_pojo,
} from "./base"
import type { BaseDbFields } from "./base"

export interface UserDbFields extends BaseDbFields {
    email: string
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                           *
 *                                                                           *
 *                                                                           *
 *                               Transmission                                *
 *                                                                           *
 *                                                                           *
 *                                                                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

export function from_pojo(user: UserView) {
    user = base_from_pojo(user)
    return user
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                           *
 *                                                                           *
 *                                                                           *
 *                                   Views                                   *
 *                                                                           *
 *                                                                           *
 *                                                                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// tslint:disable-next-line
export interface UserView extends BaseModel {
    email: string
}
