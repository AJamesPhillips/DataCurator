import { Server } from "@hapi/hapi"

import { PATHS } from "../../shared/paths"
import { UserDb } from "../../models/user/db"
import { LOG_TAGS } from "../../shared/constants"


export function users_routes (server: Server)
{
    server.route({
        method: "GET",
        path: PATHS.API_V1.USERS_LIST,
        handler: async function (request, h) {

            server.log(LOG_TAGS.INFO, "Fetching users")

            const res = await UserDb.findAll()

            server.log(LOG_TAGS.INFO, "Fetched users")
            return JSON.stringify(res)
        }
    })
}
