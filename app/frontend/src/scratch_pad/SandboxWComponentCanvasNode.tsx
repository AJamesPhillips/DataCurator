import { FunctionalComponent } from "preact"
import { connect, ConnectedProps, Provider } from "react-redux"

import type { KnowledgeView } from "../shared/interfaces/knowledge_view"
import { ACTIONS } from "../state/actions"
import { get_starting_state } from "../state/starting_state"
import type { RootState } from "../state/State"
import { get_store } from "../state/store"
import { prepare_new_VAP_set } from "../wcomponent/CRUD_helpers/prepare_new_VAP_set"
import type { WComponent } from "../wcomponent/interfaces/SpecialisedObjects"
import type { WComponentNodeStateV2 } from "../wcomponent/interfaces/state"
import { VAPsType } from "../wcomponent/interfaces/VAPsType"
import { WComponentCanvasNode } from "../wcomponent_canvas/node/WComponentCanvasNode"



function sandbox_code ()
{
    const created_at = new Date("2021-01-01")

    const VAP_set1 = prepare_new_VAP_set(VAPsType.undefined, {}, [], -1)
    VAP_set1.entries[0]!.value = "thing"
    VAP_set1.entries[0]!.probability = 0.6
    VAP_set1.shared_entry_values = { conviction: 0.4 }
    const wc11: WComponentNodeStateV2 = {
        type: "statev2",
        subtype: "boolean",
        id: "wc11",
        created_at,
        base_id: -1,
        title: "wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title wc11 title ",
        description: "wc11 description",
        // boolean_false_str: "this is false",
        // boolean_true_str: "this is true",
        values_and_prediction_sets: [
            VAP_set1,
        ]
    }


    const VAP_set2 = prepare_new_VAP_set(VAPsType.undefined, {}, [], -1)
    VAP_set2.entries[0]!.probability = 0
    const wc14: WComponentNodeStateV2 = {
        ...wc11,
        id: "wc14",
        created_at,
        base_id: -1,
        title: "wc14 title ${value}",
        description: "wc14 description",
        values_and_prediction_sets: [
            VAP_set2,
        ]
    }

    const wcomponents = [wc11, wc14]

    const kv10: KnowledgeView = {
        id: "kv10",
        title: "kv10 title",
        description: "kv10 description",
        wc_id_map: {
            [wc11.id]: { left: 400, top: 100 },
            [wc14.id]: { left: 700, top: 100 },
        },
        created_at,
        base_id: -1,
        sort_type: "normal",
    }


    return { wcomponents, wc11, kv10 }
}



export function SandboxWComponentCanvasNode ()
{
    const { wcomponents, wc11, kv10 } = sandbox_code()

    let override_preloaded_state: RootState = get_starting_state()

    override_preloaded_state = {
        ...override_preloaded_state,
        routing: {
            route: "wcomponents",
            sub_route: null,
            item_id: wc11.id,
            args: {
                ...override_preloaded_state.routing.args,
                view: "knowledge",
                subview_id: kv10.id,
            },
        },
    }

    const store = get_store({ load_state_from_storage: false, override_preloaded_state })




    store.dispatch(ACTIONS.specialised_object.replace_all_specialised_objects({
        specialised_objects: { wcomponents, knowledge_views: [kv10] }
    }))


    return <Provider store={store}>
        <WComponentCanvasNodes wcomponents={wcomponents} />
    </Provider>
}



interface WComponentCanvasNodesOwnProps
{
    wcomponents: WComponent[]
}

const map_state = (state: RootState) => ({
    rich_text_formatting: state.display_options.consumption_formatting,
})
const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & WComponentCanvasNodesOwnProps

function _WComponentCanvasNodes (props: Props)
{
    return <div>
        WComponentCanvasNodes {"" + props.rich_text_formatting}

        {props.wcomponents.map(({ id }) => <WComponentCanvasNode id={id} />)}
    </div>
}

const WComponentCanvasNodes = connector(_WComponentCanvasNodes) as FunctionalComponent<WComponentCanvasNodesOwnProps>
