import * as Hapi from "@hapi/hapi"
import * as Boom from "boom"

import "./shared/utils/monkey_patch"

import CONFIG from "./utils/config"
import { LOG_TAGS } from "./shared/constants"
import PRIVATE_SERVER_CONFIG from "./private_server_config"

import * as Home from "./views/home/routes"
import * as API from "./views/api/routes"


const server_options: Hapi.ServerOptions = {
    port: PRIVATE_SERVER_CONFIG.SERVER_PORT,
    host: PRIVATE_SERVER_CONFIG.SERVER_HOST,
    debug: { log: ["yes"] },
    routes: {
        cors: CONFIG.ENV_DEVELOPMENT ? ({
            // Also allows API calls from server code as these have origin "
            origin: ["http://localhost:3000"],  // address of webpack dev server
            credentials: true,
        }) : false,
    }
}

const base_server = new Hapi.Server(server_options)

/**
 * Override global console.log console.error
 * Can not override in tests as they are used by jest for logging out errors.
 */

if (!CONFIG.ENV_TEST) {

    // console.log = function(message: string, arg2?: string) {

    //     if (arg2) {
    //         base_server.log(LOG_TAGS.EXCEPTION, "console.log called with second " +
    //             "argument from : " + (new Error().stack) + "\n\n>>>>> Pass single argument. <<<<<\n")
    //         message += JSON.stringify(arg2)
    //     }

    //     // Special case POSTGRES for now and allow it to use the app server log
    //     // mechanism.  TODO: have sequelize logger manage it"s own file
    //     if (message.startsWith("POSTGRES:")) {
    //         base_server.log(LOG_TAGS.DATABASE, message)
    //         return
    //     }

    //     base_server.log(LOG_TAGS.EXCEPTION, "console.log called.  Do not use console.log, use server.log() instead.  Console.log called from: " + (new Error().stack))
    //     base_server.log(LOG_TAGS.INFO, message)
    // }

    // console.error = function(message: string, arg2?: string) {

    //     if (arg2) {
    //         base_server.log(LOG_TAGS.EXCEPTION, "console.log called with second " +
    //             "argument from : " + (new Error().stack) + "\n Pass single argument.")
    //         message += JSON.stringify(arg2)
    //     }

    //     base_server.log(LOG_TAGS.EXCEPTION, "console.error called from: " +
    //         (new Error().stack) + "\nUse server.log() instead.")
    //     base_server.log(LOG_TAGS.EXCEPTION, message)
    // }
}




async function setup_server ()
{
    await base_server.start()

    await base_server.register({
        plugin: require("hapi-pino"),
        options: {
          prettyPrint: process.env.NODE_ENV !== "production",
          // Redact Authorization headers, see https://getpino.io/#/docs/redaction
          redact: ["req.headers.authorization"]
        }
    })

    // await base_server.register({
    //     plugin: require("poop"),
    //     options: ({
    //         logPath: __dirname + "/error.log"
    //     } as any)
    // })
    // base_server.log(__dirname + "/error.log")

    base_server.ext("onPreResponse", (request, h) => {

        if ((request.response as Boom.BoomError).isBoom) {
            const err_output = (request.response as Boom.BoomError).output as Boom.Output
            const errName = err_output.payload.error
            const statusCode = err_output.payload.statusCode

            return h.response(`Error encounted`).code(statusCode)
        }

        return h.continue
    })

    Home.routes(base_server)
    API.routes(base_server)

    base_server.log(LOG_TAGS.INFO, `Server running at: ${base_server.info!.uri}`)
}


if (require.main === module) {
    setup_server()
    .catch(err => { throw err })
}


let setup_server_for_tests = false
/**
 * throws if unsuccessful (tests and server should fail hard)
 */
export function get_server_for_tests (): Promise<Hapi.Server> {

    if (!setup_server_for_tests) {

        // Need to call initialize to finalise plugins and start cache
        const result: Promise<Hapi.Server | void> = base_server.initialize()
        .then(() =>
        {
            setup_server_for_tests = true
            return base_server
        })
        .catch(err =>
        {
            if (err) {
                throw err
            }
        })

        return result as any
    }

    return Promise.resolve(base_server)
}
