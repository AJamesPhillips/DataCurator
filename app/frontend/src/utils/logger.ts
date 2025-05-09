
const LOG_LEVELS = {
    debug: 10,
    log: 20,
    info: 20,
    warn: 30,
    error: 40,
}

const LOG_LEVEL = LOG_LEVELS.debug

export const logger = {
    debug: (msg: string) =>
    {
        if (LOG_LEVEL > LOG_LEVELS.debug) return
        console.debug(msg)
    },
    log: (msg: string) =>
    {
        if (LOG_LEVEL > LOG_LEVELS.log) return
        console.log(msg)
    },
    info: (msg: string) =>
    {
        if (LOG_LEVEL > LOG_LEVELS.info) return
        console.info(msg)
    },
    warn: (msg: string) =>
    {
        if (LOG_LEVEL > LOG_LEVELS.warn) return
        console.warn(msg)
    },
    error: (msg: string) =>
    {
        console.error(msg)
    },
}
