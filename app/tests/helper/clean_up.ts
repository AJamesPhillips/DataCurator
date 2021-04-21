import * as _ from "lodash"

import { sequelize } from "../../server/utils/sequelize_db"
import { UserDb } from "../../server/models/user/db"

export function clear_db(): PromiseLike<void> {

    return UserDb.destroy({ where: {}, force: true})
    .then(() => {
        return
    })
}

/**
 * Close db connections
 *      afterAll(() => {
 *          sequelize.close()
 *      })
 */
export function clean_up () {
    /**
     * Mad error.  If the `<---` line is uncommented then the tests start
     * failing with the following error.  Presumably this is some kind of
     * circular import error as the type of `Schema` in `joi/lib/any.js:36`
     * is `{}`.
     *
     *      import {get_server_for_tests} from "../../server/main"
     *
     *      function clean_up () {
     *          const server = get_server_for_tests()  // <---
     *          ...
     *
     * TypeError: Cannot read property 'validate' of undefined
     * at Object.<anonymous>.internals.checkOptions (/Users/ajp/learning/programming/reactjs_webpack/example_app/
     *    kanban/node_modules/hapi-auth-cookie/node_modules/joi/lib/any.js:36:35)
     * at Object.<anonymous>.internals.Any._validateWithOptions (/Users/ajp/learning/programming/reactjs_webpack/
     *    example_app/kanban/node_modules/hapi-auth-cookie/node_modules/joi/lib/any.js:628:19)
     * at root.validate (/Users/ajp/learning/programming/reactjs_webpack/example_app/kanban/node_modules/
     *    hapi-auth-cookie/node_modules/joi/lib/index.js:104:23)
     * at Object.<anonymous>.internals.implementation [as cookie] (/Users/ajp/learning/programming/reactjs_webpack/
     *    example_app/kanban/node_modules/hapi-auth-cookie/lib/index.js:46:25)
     * at Object.<anonymous>.internals.Auth.strategy (/Users/ajp/learning/programming/reactjs_webpack/example_app/
     *    kanban/node_modules/hapi/lib/auth.js:51:43)
     * at Object.<anonymous>.internals.Plugin._applyChild (/Users/ajp/learning/programming/reactjs_webpack/
     *    example_app/kanban/node_modules/hapi/lib/plugin.js:600:19)
     * at Object.strategy (/Users/ajp/learning/programming/reactjs_webpack/example_app/kanban/node_modules/hapi/
     *    lib/plugin.js:64:54)
     * at Object.setup_hapi_auth_cookie (/Users/ajp/learning/programming/reactjs_webpack/example_app/kanban/src/
     *    server/user_session/hapi_auth_cookie.ts:15:17)
     * at Object.routes (/Users/ajp/learning/programming/reactjs_webpack/example_app/kanban/src/server/user_session/
     *    routes.ts:7:24)
     * at /Users/ajp/learning/programming/reactjs_webpack/example_app/kanban/src/server/main.ts:37:21
     * at process.nextTick (/Users/ajp/learning/programming/reactjs_webpack/example_app/kanban/node_modules/hapi/
     *    node_modules/hoek/lib/index.js:854:22)
     * at _combinedTickCallback (internal/process/next_tick.js:73:7)
     * at process._tickCallback (internal/process/next_tick.js:104:9)
     */
    sequelize.close()
}
