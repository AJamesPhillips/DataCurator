import { h } from "preact"

import type { PatternAttribute } from "../state/State"
import { PatternAttributeListEntry, PatternAttributeListHeader } from "./PatternAttributeListEntry"


type Props = {
    attributes: PatternAttribute[]
}


export function PatternAttributesList (props: Props)
{
    return <table>
        <PatternAttributeListHeader />
        {props.attributes.map((attribute, i) => <tr>
            <PatternAttributeListEntry attribute={attribute} editable={false} />
        </tr>)}
    </table>
}
