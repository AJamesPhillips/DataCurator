import { Server } from "@hapi/hapi"

import { PATHS } from "../../shared/paths"
import { UserDb } from "../../models/user/db"


export function routes (server: Server)
{
    server.route({
        method: "GET",
        path: PATHS.HOME,
        handler: async function (request, h) {

            const count = await UserDb.count()

            return `Hello World! ${count} users in db`
        }
    })

    server.route({
        method: "GET",
        path: PATHS.ERROR,
        handler: async function (request, h) {

            throw new Error("Nothing actually wrong, controlled error.")
        }
    })
}
