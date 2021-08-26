import { h } from "preact"



export const LOCAL_STORAGE_STATE_KEY = "data_curator_state"
export const CLIENT_NAME = "Data Curator"


export const CONTACT_EMAIL_ADDRESS = "ajp@centerofci.org"

export const CONTACT_EMAIL_ADDRESS_TAG = (
    <a
        href={`mailto: ${CONTACT_EMAIL_ADDRESS}`}
        target="_blank"
    >
        {CONTACT_EMAIL_ADDRESS}
    </a>
)



// The process offered by Solid is terrible, buggy, does not work
export const LOCAL_STORAGE_KEY__SOLID_SESSION_RESTORE_URL = "solid_session_restore_url"
