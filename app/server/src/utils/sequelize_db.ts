import { Sequelize, Options } from "sequelize"
import PRIVATE_SERVER_CONFIG from "../private_server_config"

function logger(msg: string) {
    if (PRIVATE_SERVER_CONFIG.LOG_DB) {
        console.log("POSTGRES: " + msg)
    }
}

const options: Options = {
    host: PRIVATE_SERVER_CONFIG.DB_ADDRESS,
    port: PRIVATE_SERVER_CONFIG.DB_PORT,
    dialect: PRIVATE_SERVER_CONFIG.DB_DIALECT,
    pool: {
        max: 10,
        min: 1,
        idle: 10000,
    },
    logging: logger,
    dialectOptions: {
        ssl: false,
    },
    omitNull: true,
}

export const sequelize = new Sequelize(
    PRIVATE_SERVER_CONFIG.DB_DATABASE,
    PRIVATE_SERVER_CONFIG.DB_USERNAME,
    PRIVATE_SERVER_CONFIG.DB_PASSWORD, options)
