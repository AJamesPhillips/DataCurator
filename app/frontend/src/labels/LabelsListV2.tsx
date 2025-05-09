
import { LabelV2 } from "./LabelV2"



interface OwnProps
{
    label_ids: string[] | undefined
}


export function LabelsListV2 (props: OwnProps)
{
    return <div style={{ display: "flex", flexWrap: "wrap" }}>
        {(props.label_ids || []).map(id => <LabelV2 wcomponent_id={id} />)}
    </div>
}
