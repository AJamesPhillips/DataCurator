import { UserDb } from "../../server/models/user/db"
import { server_normal_user } from "./user"
import { clear_db } from "./clean_up"

export function DANGER_force_sync_db_for_tests () {

    const ENV = process.env.NODE_ENV
    if (ENV !== "test") {
        throw new Error(`Only possible to run tests with NODE_ENV === test but is: ${ENV}`)
    }

    return UserDb.sync({force: true})
}

export const signin_user = server_normal_user()

export function seed_db (): PromiseLike<void> {

    return clear_db()
    .then(() => {
        // Add database seeds for tests

        const promise = UserDb.bulkCreate([signin_user])

        return promise.then(() => { return })
    })
}
