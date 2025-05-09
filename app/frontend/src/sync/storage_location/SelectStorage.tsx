
import { Modal } from "../../modal/Modal"
import { StorageOptionsForm } from "./StorageOptionsForm"



interface OwnProps
{
    on_close?: () => void
}


export function SelectStorage (props: OwnProps)
{
    const { on_close } = props

    return <Modal
        title={<div style={{ margin: 10 }}>
            <h2 style={{ display: "inline" }}>Knowledge Bases</h2>
        </div>}
        size="medium"

        on_close={on_close && (e =>
        {
            e?.stopImmediatePropagation()
            on_close()
        })}


        child={<StorageOptionsForm on_close={on_close} />}
    />
}
