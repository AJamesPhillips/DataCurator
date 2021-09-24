import { h } from "preact"

import { Modal } from "../../modal/Modal"
import { UserSigninRegisterForm } from "./UserSigninRegisterForm"



interface OwnProps {
    on_close?: () => void
}


export function UserSigninRegister (props: OwnProps)
{
    return <Modal
        title={<div style={{ margin: 10 }}>
            <h2>Signin / Register</h2>
        </div>}
        size="medium"


        on_close={props.on_close} // not closeable until signed in


        child={<UserSigninRegisterForm />}
    />
}
