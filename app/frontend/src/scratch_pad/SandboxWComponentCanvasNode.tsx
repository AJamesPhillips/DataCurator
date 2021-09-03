import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps, Provider } from "react-redux"

import { WComponentCanvasNode } from "../knowledge/canvas_node/WComponentCanvasNode"
import { prepare_new_VAP_set } from "../knowledge/multiple_values/utils"
import type { CreationContextState } from "../shared/creation_context/state"
import { VAPsType } from "../shared/wcomponent/interfaces/generic_value"
import type { WComponentJudgement } from "../shared/wcomponent/interfaces/judgement"
import type { KnowledgeView } from "../shared/wcomponent/interfaces/knowledge_view"
import type { WComponentNodeState, WComponentNodeStateV2 } from "../shared/wcomponent/interfaces/state"
import { ACTIONS } from "../state/actions"
import { get_starting_state } from "../state/starting_state"
import type { RootState } from "../state/State"
import { get_store } from "../state/store"



const created_at = new Date("2021-01-01")

const wc10: WComponentNodeState = {
    type: "state",
    id: "wc10",
    created_at,
    title: "wc10 title",
    description: "wc10 description",
}

const creation_context: CreationContextState = { use_creation_context: true, creation_context: {
    custom_created_at: created_at, label_ids: [],
} }


const VAP_set1 = prepare_new_VAP_set(VAPsType.undefined, [], creation_context)
VAP_set1.entries[0]!.value = "thing"
VAP_set1.entries[0]!.probability = 0.6
VAP_set1.shared_entry_values = { conviction: 0.4 }
const wc11: WComponentNodeStateV2 = {
    type: "statev2",
    subtype: "boolean",
    id: "wc11",
    created_at,
    title: "wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title ",
    description: "wc11 description",
    boolean_false_str: "this is false",
    boolean_true_str: "this is true",
    values_and_prediction_sets: [
        VAP_set1,
    ]
}

const wc12_judgement: WComponentJudgement = {
    type: "judgement",
    id: "wc12",
    created_at,
    title: "wc12 title",
    description: "wc12 description",
    judgement_target_wcomponent_id: wc11.id,
    judgement_operator: "==",
    judgement_comparator_value: "True",
}
const wc13_judgement: WComponentJudgement = {
    ...wc12_judgement,
    id: "wc13",
    judgement_operator: "!=",
}


const VAP_set2 = prepare_new_VAP_set(VAPsType.undefined, [], creation_context)
VAP_set2.entries[0]!.probability = 0
const wc14: WComponentNodeStateV2 = {
    ...wc11,
    id: "wc14",
    created_at,
    title: "wc14 title ${value}",
    description: "wc14 description",
    values_and_prediction_sets: [
        VAP_set2,
    ]
}

const wcomponents = [wc10, wc11, wc12_judgement, wc13_judgement, wc14]

const kv10: KnowledgeView = {
    id: "kv10",
    title: "kv10 title",
    description: "kv10 description",
    wc_id_map: {
        [wc10.id]: { left: 100, top: 100 },
        [wc11.id]: { left: 400, top: 100 },
        [wc14.id]: { left: 700, top: 100 },
    },
    created_at,
    goal_ids: [],
    sort_type: "normal",
}



export function SandboxWComponentCanvasNode ()
{

    let override_preloaded_state: RootState = get_starting_state()

    override_preloaded_state = {
        ...override_preloaded_state,
        routing: {
            route: "wcomponents",
            sub_route: null,
            item_id: wc10.id,
            args: {
                ...override_preloaded_state.routing.args,
                view: "knowledge",
                subview_id: kv10.id,
            },
        },
    }

    const store = get_store({ load_state_from_storage: false, override_preloaded_state })




    store.dispatch(ACTIONS.specialised_object.replace_all_specialised_objects({
        specialised_objects: { perceptions: [], wcomponents, knowledge_views: [kv10], wcomponent_ids_to_delete: new Set() }
    }))


    return <Provider store={store}>
        <WComponentCanvasNodes />
    </Provider>
}



const map_state = (state: RootState) => ({
    rich_text_formatting: state.display_options.consumption_formatting,
})
const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>

function _WComponentCanvasNodes (props: Props)
{
    return <div>
        WComponentCanvasNodes {"" + props.rich_text_formatting}

        {wcomponents.map(({ id }) => <WComponentCanvasNode id={id} />)}
    </div>
}

const WComponentCanvasNodes = connector(_WComponentCanvasNodes) as FunctionalComponent<{}>
