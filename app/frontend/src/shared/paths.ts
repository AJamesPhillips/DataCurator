const template_path_for_react = (fragment: string) => `:${fragment}`
export var REACT_PATH_IDS = {
    USER_UUID: "userUuid",
}

const template_path_for_hapi = (fragment: string) => `{${fragment}}`
export var HAPI_PATH_IDS = {
    USERS_ID: "userId",
}

/**
 * Note that the PATHS not under API are not shared at the moment but may in the
 * future be used for server side rendering of pages
 */
export class PATHS {

    static HOME = "/"

    static ERROR = "/error/jfa092ksmf239qkvxcv32"

    // Session handling
    static _SESSION_INDEX = "/session"
    static SIGNIN = PATHS._SESSION_INDEX + "/signin"
    static SIGNOUT = PATHS._SESSION_INDEX + "/signout"
    static SIGNOUT_SUCCESS = PATHS._SESSION_INDEX + "/signed-out"

    // User account
    static _USER = "/user"
    static USER_ACCOUNT(userUuid: string = template_path_for_react(REACT_PATH_IDS.USER_UUID)) {
        return PATHS._USER + `/${userUuid}`
    }
    // User account - Registration
    static USER_REGISTER = PATHS._USER + "/register"

    // static DEACTIVATE_ACCOUNT = PATHS._USER + "/deactivate-account"

    // Legals
    static LEGAL_INDEX = "/legal"
    static LEGAL_COOKIE_POLICY = PATHS.LEGAL_INDEX + "/cookie-policy"

    // PROTECTED - example of private route
    static PROTECTED = "/protected"

    static _API_V1 = "/api/v1"
    static API_V1 = {
        BOOTSTRAP: PATHS._API_V1 + "/bootstrap",

        // User
        USER_REGISTER: PATHS._API_V1 + "/user/register",

        // Session handling
        SIGNIN: PATHS._API_V1 + "/session/signin",
        SIGNOUT: PATHS._API_V1 + "/session/signout",

        // PROTECTED - example of private route
        PROTECTED: PATHS._API_V1 + "/protected",

        // Users
        USERS_LIST: PATHS._API_V1 + "/users/",
        USERS_GET: (userId: string = template_path_for_hapi(HAPI_PATH_IDS.USERS_ID)) => {
            return PATHS._API_V1 + "/users/" + userId
        },

        //
        STATE: PATHS._API_V1 + "/state/",
        SPECIALISED_STATE: PATHS._API_V1 + "/specialised_state/",
    }
}
