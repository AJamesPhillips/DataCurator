import { UserDbFields } from "./db"
import {
    UserView,
} from "../../shared/models/user"

export interface AuthedUser {
    uuid: string
}

/**
 * Only fields that the user / admin should be allowed to view
 */
export function viewable_fields(user: UserDbFields, authed_user?: AuthedUser): UserView {

    let user_view: UserView = {
        uuid: user.uuid,
        created_at: user.created_at,
        modified_at: user.modified_at,
        deleted_at: user.deleted_at,

        email: user.email,
    }

    if (!authed_user) {
        user_view.email = "Not visible"
    }

    return user_view
}
