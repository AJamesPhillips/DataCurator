import { h } from "preact"

import { Modal } from "../modal/Modal"



interface OwnProps
{
    on_blur: () => void
}


export function SelectStorageType (props: OwnProps)
{
    return <Modal
        on_close={() => props.on_blur && props.on_blur()}
        title="Select Storage Type"
        child={() => <div>
            One
            <br />
            Two
            <br />
            Three
            <br />
            Confirm
        </div>}
    />
}
