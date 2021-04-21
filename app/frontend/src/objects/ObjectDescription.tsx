import { h } from "preact"

import type { ObjectWithCache } from "../state/State"
import { ObjectLabels } from "./ObjectLabels"
import { object_content } from "./object_content"


interface OwnProps {
    object: ObjectWithCache
}


export function ObjectDescription (props: OwnProps)
{
    return <div>
        {object_content({ object: props.object })}
        <ObjectLabels object={props.object} />
    </div>
}
