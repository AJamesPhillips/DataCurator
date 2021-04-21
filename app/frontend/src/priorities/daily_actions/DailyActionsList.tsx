import { h } from "preact"
import { ObjectsListModal } from "../../objects/ObjectsListModal"


interface OwnProps
{
    action_ids_to_show: string[]
    on_close: () => void
}


export function DailyActionsList (props: OwnProps)
{
    return <ObjectsListModal
        object_ids={props.action_ids_to_show}
        on_close={props.on_close}
        title="Actions"
    />
}
