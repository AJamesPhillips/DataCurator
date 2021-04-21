import { h } from "preact"

import type { ObjectWithCache } from "../state/State"
import { Link } from "../utils/Link"
import { ObjectLabels } from "./ObjectLabels"
import { object_content } from "./object_content"


interface OwnProps {
    object: ObjectWithCache
    on_click?: () => void
}


export function ObjectListEntry (props: OwnProps)
{
    return [
        <td>
            <Link
                route="objects"
                sub_route={null}
                item_id={props.object.id}
                args={undefined}
                on_click={props.on_click}
            >
                {object_content({ object: props.object })}
            </Link>
        </td>,
        <td>
            <ObjectLabels object={props.object} />
        </td>,
    ]
}
