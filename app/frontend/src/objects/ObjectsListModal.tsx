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
        child={child_props => <ObjectsList object_ids={props.object_ids}></ObjectsList>}
    ></Modal>
}
