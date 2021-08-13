import { h } from "preact"

import { Modal } from "../../../modal/Modal"
import { SolidSigninForm } from "./SolidSigninForm"



interface OwnProps
{
    on_close: () => void
}


export function SelectSolidUser (props: OwnProps)
{

    return <Modal
        title={<div style={{ margin: 10 }}>
            <h2>Sign in to your Solid account</h2>
        </div>}
        size="medium"


        on_close={e =>
        {
            e?.stopImmediatePropagation()
            props.on_close()
        }}


        child={<SolidSigninForm on_close={props.on_close}/>}
    />
}
