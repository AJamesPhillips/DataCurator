import { as_string, as_int } from "./process_env"
import { APP_DETAILS } from "../shared/constants"

const NODE_ENV = as_string(process.env.NODE_ENV)
const SERVER_SCHEME = as_string(process.env.SERVER_SCHEME)
const IS_SECURE = SERVER_SCHEME === "https"
if (IS_SECURE && SERVER_SCHEME !== "https") {
    throw new Error(`Invalid env variables, SERVER_SCHEME must be https if IS_SECURE but was: ${SERVER_SCHEME}`)
}
const SERVER_PORT = as_int(process.env.SERVER_PORT)
const SERVER_HOST = as_string(process.env.SERVER_HOST)
const SERVER_URI = `${SERVER_SCHEME}://${SERVER_HOST}:${SERVER_PORT}`

const ENV_DEVELOPMENT = NODE_ENV === "development"
const ENV_TEST =        NODE_ENV === "test"
const ENV_STAGING =     NODE_ENV === "staging"
const ENV_PRODUCTION =  NODE_ENV === "production"

export default {
    NODE_ENV,
    ENV_DEVELOPMENT,
    ENV_TEST,
    ENV_STAGING,
    ENV_PRODUCTION,
    IS_SECURE,
    SERVER_URI,
    SERVER_SCHEME,
    SERVER_HOST,
    SERVER_PORT,
    APP_ID:              "app_id",
    APP_NAME:            APP_DETAILS.NAME,
    // must be the same domain as SERVER_HOST otherwise letsencrypt will fail
    SUPPORT_EMAIL:       "support@example.com",
    COMPANY_NAME:        "You company name Ltd",
    LOG:                 as_int(process.env.LOG_LEVEL),
    // Added max length to email as database is VARCHAR(255)
    MAX_EMAIL_LENGTH:    200,
    MIN_PASSWORD_LENGTH: 10,
    // TODO SECURITY research this
    // Added max password length, not sure if this helps mitigate some (D)DOS
    MAX_PASSWORD_LENGTH: 100,
    SESSION_EXPIRY_IN_MILLISECONDS: 3 * 24 * 60 * 60 * 1000,  // 3 days
    SESSION_KEEP_ALIVE:  true,
}
