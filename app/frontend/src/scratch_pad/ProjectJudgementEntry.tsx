import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { KnowledgeView } from "../shared/interfaces/knowledge_view"
import { calculate_judgement_value } from "../sharedf/judgement_badge/calculate_judgement_value"
import { JudgementBadge } from "../sharedf/judgement_badge/JudgementBadge"
import { get_title } from "../sharedf/rich_text/get_rich_text"
import { RichMarkDown } from "../sharedf/rich_text/RichMarkDown"
import { format_wcomponent_url } from "../sharedf/rich_text/templates"
import { get_wc_id_to_counterfactuals_v2_map } from "../state/derived/accessor"
import { lefttop_to_xy } from "../state/display_options/display"
import type { RootState } from "../state/State"
import type { WComponentJudgement } from "../wcomponent/interfaces/judgement"
import { get_wcomponent_state_UI_value } from "../wcomponent_derived/get_wcomponent_state_UI_value"



interface OwnProps
{
    knowledge_view: KnowledgeView
    judgement: WComponentJudgement
    created_at_ms: number
    sim_ms: number
}


const map_state = (state: RootState, { judgement }: OwnProps) =>
{
    const target_wc_id = judgement.judgement_target_wcomponent_id
    const target_wcomponent = state.specialised_objects.wcomponents_by_id[target_wc_id]

    return {
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
        target_wcomponent,
        wc_id_to_counterfactuals_map: get_wc_id_to_counterfactuals_v2_map(state),
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


const _ProjectJudgementEntry = (props: Props) =>
{
    if (!props.target_wcomponent) return <div>Can not find judgement's target wcomponent of id: {props.judgement.judgement_target_wcomponent_id}</div>


    const {
        knowledge_view, judgement, target_wcomponent,
        wc_id_to_counterfactuals_map, wcomponents_by_id, knowledge_views_by_id,
        created_at_ms, sim_ms,
    } = props
    const VAP_set_id_to_counterfactual_v2_map = wc_id_to_counterfactuals_map && wc_id_to_counterfactuals_map[target_wcomponent.id]?.VAP_sets

    return <div style={{ display: "flex", flexDirection: "row", flexBasis: "100", padding: "3px 5px", margin: 2, borderBottom: "thin solid #aaa" }}>
        <div
            style={{ flex: "5", cursor: "pointer" }}
            onClick={() =>
            {
                const wcomponent_id = target_wcomponent.id
                const url = get_url_for_wcomponent({ knowledge_view, wcomponent_id })
                window.location.href = url
            }}
        >
            <RichMarkDown
                text={get_title({ wcomponents_by_id, knowledge_views_by_id, wcomponent: target_wcomponent, wc_id_to_counterfactuals_map, created_at_ms, sim_ms })}
            />
        </div>
        <div style={{ flex: "1", textAlign: "right" }}>
            {get_wcomponent_state_UI_value({ wcomponent: target_wcomponent, VAP_set_id_to_counterfactual_v2_map, created_at_ms, sim_ms })?.values_string}
        </div>
        <div style={{ flex: "1" }}>
            &nbsp;{judgement.judgement_operator} {judgement.judgement_comparator_value}
        </div>

        {/* TODO remove this anchor tag and replace with a <Link /> component */}
        <a
            style={{ flex: "4", cursor: "pointer", display: "flex", textDecoration: "inherit", color: "inherit" }}
            href={(() => {
                const wcomponent_id = judgement.id
                return get_url_for_wcomponent({ knowledge_view, wcomponent_id })
            })()}
        >
            <JudgementBadge
                judgement={calculate_judgement_value({ judgement_wcomponent: judgement, target_wcomponent, VAP_set_id_to_counterfactual_v2_map, created_at_ms, sim_ms })}
                judgement_trend_manual={judgement.judgement_trend_manual}
                size="medium"
            />

            <RichMarkDown
                text={get_title({ wcomponents_by_id, knowledge_views_by_id, wcomponent: judgement, wc_id_to_counterfactuals_map: undefined, created_at_ms, sim_ms })}
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
