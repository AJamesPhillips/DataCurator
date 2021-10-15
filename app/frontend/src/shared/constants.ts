
export const APP_DETAILS = {
    NAME: "CCI | Data Curator"
}

export const LOG_LEVELS = {
    NONE: 0,
    CRITICAL: 1,
    ERROR: 2,
    WARN: 3,
    LOG: 4,
    DEBUG: 5,
}

export const LOG_TAGS = {
    DEBUG: "DEBUG",
    INFO: "INFO",
    ERROR: "ERROR",
    EXCEPTION: "EXCEPTION",
    SECURITY: ["INFO", "SECURITY"],
    DATABASE: ["INFO", "DATABASE"],
}


// Not actually to do with milliseconds in the hour just seems to be a good number
export const time_scale_days_to_ms_pixels_fudge_factor = 1000 * 60 * 60
