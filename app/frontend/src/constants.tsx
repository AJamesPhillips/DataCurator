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
