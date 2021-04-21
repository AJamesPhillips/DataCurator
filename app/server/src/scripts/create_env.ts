/**
 * Generates a new PRIVATE_SERVER_CONFIG_ENCRYPTION_PASSWORD and adds
 * to bottom of .env.* file for staging or production
 */
import * as crypto from "crypto";
import fs = require("fs");
import path = require("path");
import * as _ from "lodash";

const ACCEPTED_ENVS = ["staging", "production"];

const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV || !_.includes(ACCEPTED_ENVS, NODE_ENV)) {
    throw new Error(`Must call script with NODE_ENV=${ACCEPTED_ENVS} but called with: ${NODE_ENV}`);
}

crypto.randomBytes(90, (err, buffer) => {

    if (err) { throw err; }

    const PRIVATE_SERVER_CONFIG_ENCRYPTION_PASSWORD = buffer.toString("hex");
    // resolved relative to location of compiled .js file not the .ts file
    const env_file_name = path.resolve(__dirname, `../../.env.${NODE_ENV}`);
    if (!fs.existsSync(env_file_name)) {
        console.error("ERROR:  Can not copy new PRIVATE_SERVER_CONFIG_ENCRYPTION_PASSWORD " +
        `as ${env_file_name} file does not exist. \n`);
        process.exit(1);
    }

    console.log("INFO:  Copying the new PRIVATE_SERVER_CONFIG_ENCRYPTION_PASSWORD " +
        `to your ${env_file_name} file.`);

    const env = (
        "\n# Generated from create_env.js\n" +
        `PRIVATE_SERVER_CONFIG_ENCRYPTION_PASSWORD=${PRIVATE_SERVER_CONFIG_ENCRYPTION_PASSWORD}\n`
    );
    fs.appendFileSync(env_file_name, env);

    console.log("SUCCESS:  PRIVATE_SERVER_CONFIG_ENCRYPTION_PASSWORD is set to a strong random value.");
    process.exit(0);
});
