import { UserDbFields } from "../../server/models/user/db"


const date = new Date(Date.parse("2017-01-01 01:01:01.000+01"))


const partial_user = {
    created_at: date,
    modified_at: date,
    deleted_at: null,
}


const partial_normal_user = {
    uuid: "4ff930c7-43c0-51e8-d973-2b513a1305f9",
    email: "c@d.e",
}


export function server_normal_user(): UserDbFields {
    return {
        ...partial_user,
        ...partial_normal_user,
    }
}
