import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { lefttop_to_xy } from "../canvas/MoveToPositionButton"

import { calculate_judgement_value } from "../knowledge/judgements/calculate_judgement_value"
import { JudgementBadge } from "../knowledge/judgements/JudgementBadge"
import { format_wcomponent_url, get_title } from "../shared/models/get_rich_text"
import { get_wcomponent_state_value } from "../shared/models/get_wcomponent_state_value"
import type { WComponentJudgement } from "../shared/models/interfaces/judgement"
import type { KnowledgeView } from "../shared/models/interfaces/SpecialisedObjects"
import { RichMarkDown } from "../sharedf/RichMarkDown"
import type { RootState } from "../state/State"



interface OwnProps
{
    knowledge_view: KnowledgeView
    judgement: WComponentJudgement
    created_at_ms: number
    sim_ms: number
}


const map_state = (state: RootState, { judgement }: OwnProps) => ({
    wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    target_wcomponent: state.specialised_objects.wcomponents_by_id[judgement.judgement_target_wcomponent_id],
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


const _ProjectJudgementEntry = (props: Props) =>
{
    if (!props.target_wcomponent) return <div>Can not find judgement's target wcomponent of id: {props.judgement.judgement_target_wcomponent_id}</div>


    const { knowledge_view, judgement, target_wcomponent, wcomponents_by_id, created_at_ms, sim_ms } = props

    return <div style={{ display: "flex", flexDirection: "row", flexBasis: "100", padding: "3px 5px", margin: 2, borderBottom: "thin solid #aaa" }}>
        <div
            style={{ flex: "5", cursor: "pointer" }}
            onClick={() =>
            {
                const wcomponent_id = target_wcomponent.id
                const url = get_url_for_wcomponent({ knowledge_view, wcomponent_id })
                document.location.href = url
            }}
        >
            <RichMarkDown
                text={get_title({ rich_text: true, wcomponents_by_id, wcomponent: target_wcomponent, created_at_ms, sim_ms })}
            />
        </div>
        <div style={{ flex: "1", textAlign: "right" }}>
            {get_wcomponent_state_value(target_wcomponent, created_at_ms, sim_ms).value}
        </div>
        <div style={{ flex: "1" }}>
            &nbsp;{judgement.judgement_operator} {judgement.judgement_comparator_value}
        </div>
        <a
            style={{ flex: "4", cursor: "pointer", display: "flex", textDecoration: "inherit", color: "inherit" }}
            href={(() => {
                const wcomponent_id = judgement.id
                return get_url_for_wcomponent({ knowledge_view, wcomponent_id })
            })()}
        >
            <JudgementBadge
                judgement={calculate_judgement_value({ wcomponent: judgement, target_wcomponent, created_at_ms, sim_ms })}
            />

            <RichMarkDown
                text={get_title({ rich_text: true, wcomponents_by_id, wcomponent: judgement, created_at_ms, sim_ms })}
            />
        </a>
    </div>
}

export const ProjectJudgementEntry = connector(_ProjectJudgementEntry) as FunctionalComponent<OwnProps>



interface GetUrlForWcomponentArgs
{
    knowledge_view: KnowledgeView
    wcomponent_id: string
}
function get_url_for_wcomponent (args: GetUrlForWcomponentArgs)
{
    const position = args.knowledge_view.wc_id_map[args.wcomponent_id]
    const result = lefttop_to_xy({ ...position, zoom: 100 }, true)

    const x = result && result.x || 0
    const y = result && result.y || 0

    return `/app${format_wcomponent_url("", args.wcomponent_id)}`
        + `&x=${x}&y=${y}&zoom=${100}`
        + `&view=knowledge&subview_id=${args.knowledge_view.id}`
}
