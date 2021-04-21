// This file and sequelize dependence on a config.json is a burden.

import * as _ from "lodash";
import path = require("path");
import fs = require("fs");

function get_env (our_env: string) {

    // Note the path is relative to the compiled .js file not this .ts file
    let file_name = path.resolve(__dirname, "../../.env." + our_env);
    const ENV_VARS_STRING: string = fs.readFileSync(file_name, "utf8");

    ENV_VARS_STRING.split("\n").forEach((element) => {
        const parts = element.split("=");
        process.env[parts[0]] = parts[1];
    });

    return _.clone(process.env);
}

export = function() {
    // TODO remove nasty hack to figure out what env is being used inside the script
    const ENV_INDEX = process.argv.indexOf("--env");
    const ENV = process.argv[ENV_INDEX + 1];

    const ENV_VARS = get_env(ENV);

    let config = {
        [ENV]: {
            database: ENV_VARS.PRIVATE_SERVER_CONFIG_DB_DATABASE,
            username: ENV_VARS.PRIVATE_SERVER_CONFIG_DB_USERNAME,
            password: ENV_VARS.PRIVATE_SERVER_CONFIG_DB_PASSWORD,
            host: ENV_VARS.PRIVATE_SERVER_CONFIG_DB_ADDRESS,
            port: ENV_VARS.PRIVATE_SERVER_CONFIG_DB_PORT,
            dialect: ENV_VARS.PRIVATE_SERVER_CONFIG_DB_DIALECT,
        }
    };
    return config;
};
