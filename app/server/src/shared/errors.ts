import { str_enum } from "./utils/str_enum"


export const ERRORS = str_enum([
    // General errors
    "UNKNOWN_ERROR",

    // Request errors
    "KEY_MISSING",

    // Model errors
    "FIELD_MISSING",
    "FIELD_INVALID",
    "EMAIL_FIELD_INVALID",
    "NAME_FIELD_INVALID",

    // User creation
    "EMAIL_ALREADY_REGISTERED",

    // Session creation
    "ALREADY_SIGNED_IN",
    "ALREADY_SIGNED_OUT",
    "EMAIL_OR_PASSWORD_NOT_RECOGNISED",
])
export type ERROR = keyof typeof ERRORS
