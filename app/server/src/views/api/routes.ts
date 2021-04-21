import { Server } from "@hapi/hapi"

import { state_routes } from "./state"
import { users_routes } from "./users"


export function routes (server: Server)
{
    users_routes(server)
    state_routes(server)
}
