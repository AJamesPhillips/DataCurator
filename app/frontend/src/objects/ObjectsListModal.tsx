import { h } from "preact"

import { Modal } from "../modal/Modal"
import { ObjectsList } from "./ObjectsList"



interface OwnProps
{
    object_ids: string[]
    on_close: () => void
    title?: string
}


export function ObjectsListModal (props: OwnProps)
{
    return <Modal
        on_close={props.on_close}
        title={props.title || "Objects"}
        child={<ObjectsList object_ids={props.object_ids} />}
    />
}
