import { h } from "preact"

import { Modal } from "../../modal/Modal"
import { UserSigninRegisterForm } from "./UserSigninRegisterForm"



interface OwnProps {}


export function UserSigninRegister (props: OwnProps)
{
    return <Modal
        title={<div style={{ margin: 10 }}>
            <h2>Signin / Register</h2>
        </div>}
        size="medium"


        on_close={undefined} // not closeable until signed in


        child={<UserSigninRegisterForm />}
    />
}
