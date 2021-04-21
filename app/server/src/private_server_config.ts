import { Dialect } from "sequelize"
import { writeFileSync, readFileSync, existsSync } from "fs"

import { as_string, as_int } from "./utils/process_env"


function as_dialect (dialect: any): Dialect
{
    dialect = as_string(dialect)
    const dialects: Dialect[] = ["mysql", "postgres", "sqlite", "mariadb", "mssql"]

    if (!dialects.includes(dialect)) throw new Error(`Unsupported dialect: ${dialect}`)

    return dialect as Dialect
}


export default {
    SERVER_SCHEME:            as_string(process.env.PRIVATE_SERVER_CONFIG_SCHEME),
    SERVER_HOST:              as_string(process.env.PRIVATE_SERVER_CONFIG_HOST),
    SERVER_PORT:                 as_int(process.env.PRIVATE_SERVER_CONFIG_PORT),
    DB_DATABASE:              as_string(process.env.PRIVATE_SERVER_CONFIG_DB_DATABASE),
    DB_USERNAME:              as_string(process.env.PRIVATE_SERVER_CONFIG_DB_USERNAME),
    DB_PASSWORD:              as_string(process.env.PRIVATE_SERVER_CONFIG_DB_PASSWORD),
    DB_ADDRESS:               as_string(process.env.PRIVATE_SERVER_CONFIG_DB_ADDRESS),
    DB_PORT:                     as_int(process.env.PRIVATE_SERVER_CONFIG_DB_PORT),
    DB_DIALECT:              as_dialect(process.env.PRIVATE_SERVER_CONFIG_DB_DIALECT),
    LOG_DB:                      as_int(process.env.PRIVATE_SERVER_CONFIG_LOG_DB),
    LOG_APP_SERVER_DIRECTORY: as_string(process.env.PRIVATE_SERVER_CONFIG_LOG_APP_SERVER_DIRECTORY),
    ENCRYPTION_PASSWORD:      as_string(process.env.PRIVATE_SERVER_CONFIG_ENCRYPTION_PASSWORD),
}



interface Config
{
    output_markdown_directory: string
}


function upsert_config ()
{
    const config_file_path = "./config.json"
    const default_config: Config = { output_markdown_directory: "" }

    if (!existsSync(config_file_path))
    {
        writeFileSync(config_file_path, JSON.stringify(default_config, null, 2))
    }

    // TODO error handling and check for attributes against expected schema
    const config = JSON.parse(readFileSync(config_file_path).toString()) as Config

    if (config.output_markdown_directory)
    {
        if (!config.output_markdown_directory.endsWith("/"))
        {
            config.output_markdown_directory = config.output_markdown_directory + "/"
        }
    }

    return config
}

export const config = upsert_config()
