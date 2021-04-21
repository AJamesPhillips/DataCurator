/**
 * This script, when run as development with:
 *      app$ NODE_ENV=development node compiled_all/scripts/seed_db.js
 * will seed the database.
 */

import * as Sequelize from "sequelize"

import { UserDb, UserDbFields } from "../models/user/db"

const NODE_ENV = process.env.NODE_ENV

if (NODE_ENV !== "development") {

    throw new Error(`Must call script with NODE_ENV=development but called with: ${NODE_ENV}`)

} else {

    /**
     * We already have the app_id etc stored in the .env.* file so extract
     * and store in db
     */

    const date = new Date(Date.parse("2017-01-01 01:01:01.000+01"))
    const user: UserDbFields = {
        uuid: "ba66a0b8-04bb-4e57-a23a-dd86822b099f",
        created_at: date,
        modified_at: date,
        deleted_at: null,
        email: "a@b.c",
    }

    console.log("INFO:  Seeding db.")

    // seed user table

    UserDb.create(user)
    .then(() => {

        console.log(`SUCCESS:  Saved a test user to db with email: ${user.email} and password: "asdfasdf".`)
    }, (err) => {

        if (err instanceof Sequelize.UniqueConstraintError) {
            console.error(`ERROR:  Duplicate of the test user already found in db.  Skipping saving user to db.`)
            process.exit(1)
            return
        }

        console.error(`ERROR:  whilst trying to add a test user to db:\n\n  `, err)
        process.exit(1)
    })

    // exit

    .then(() => {

        process.exit(0)
    })
}
