import { h } from "preact"

import { Modal } from "../../../modal/Modal"
import { UserAccountInfoForm } from "./UserAccountInfoForm"



interface OwnProps
{
    on_close: () => void
}


export function UserAccountInfo (props: OwnProps)
{

    return <Modal
        title={<div style={{ margin: 10 }}>
            <h2>Your profile</h2>
        </div>}
        size="medium"


        on_close={e =>
        {
            e?.stopImmediatePropagation()
            props.on_close()
        }}


        child={<UserAccountInfoForm on_close={props.on_close}/>}
    />
}
