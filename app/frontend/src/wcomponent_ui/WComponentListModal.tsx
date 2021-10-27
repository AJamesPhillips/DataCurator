import { h } from "preact"

import { Modal } from "../modal/Modal"
import { WComponentsList } from "./WComponentsList"



interface OwnProps
{
    object_ids: string[]
    on_close: () => void
    title?: string
}


export function WComponentListModal (props: OwnProps)
{
    return <Modal
        on_close={props.on_close}
        title={props.title || "Objects"}
        child={<WComponentsList wcomponent_ids={props.object_ids} />}
    />
}
