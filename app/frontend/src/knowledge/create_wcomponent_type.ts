import type { WComponentJudgement } from "../shared/models/interfaces/judgement"
import type {
    WComponent,
    WComponentNode,
    WComponentConnection,
} from "../shared/models/interfaces/SpecialisedObjects"
import type { WComponentNodeStateV2 } from "../shared/models/interfaces/state"
import type { WComponentBase } from "../shared/models/interfaces/wcomponent"
import { ACTIONS } from "../state/actions"
import { get_middle_of_screen } from "../state/display/display"
import { get_current_UI_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { AddToKnowledgeViewArgs } from "../state/specialised_objects/wcomponents/actions"
import { config_store } from "../state/store"
import { floor_datetime } from "../utils/datetime"
import { get_new_wcomponent_id } from "../utils/utils"



export function get_new_wcomponent_object (args: Partial<WComponent>)
{
    const created_at = new Date()
    const base: WComponentBase = {
        id: get_new_wcomponent_id(),
        created_at,
        custom_created_at: floor_datetime(created_at, "hour"),
        title: "",
        description: "",
        type: "process",
    }

    let wcomponent: WComponent

    if (args.type === "causal_link" || args.type === "relation_link")
    {
        const causal_link: WComponentConnection = {
            from_id: "",
            to_id: "",
            from_type: undefined,
            to_type: undefined,
            ...base,
            ...args,
            type: args.type, // only added to remove type warning
        }
        wcomponent = causal_link
    }
    else if (args.type === "judgement")
    {
        const judgement: WComponentJudgement = {
            judgement_target_wcomponent_id: "",
            judgement_operator: "!=",
            judgement_comparator_value: "",
            judgement_manual: undefined,
            ...base,
            ...args,
            type: args.type, // only added to remove type warning
        }
        wcomponent = judgement
    }
    else if (args.type === "statev2")
    {
        const statev2: WComponentNodeStateV2 = {
            ...base,
            subtype: "boolean",
            values_and_prediction_sets: [],
            ...args,
            type: args.type, // only added to remove type warning
        }
        wcomponent = statev2
    }
    else
    {
        const node: WComponentNode = {
            // encompassed_by: "",
            ...base,
            ...args,
            type: args.type || "process", // only added to remove type warning
        }
        wcomponent = node
    }

    return wcomponent
}



export function create_wcomponent (args: Partial<WComponent>)
{
    const store = config_store()
    const state = store.getState()

    const wcomponent = get_new_wcomponent_object(args)

    const current_knowledge_view = get_current_UI_knowledge_view_from_state(state)

    let add_to_knowledge_view: AddToKnowledgeViewArgs | undefined = undefined
    if (current_knowledge_view)
    {
        const position = get_middle_of_screen(state)

        add_to_knowledge_view = { id: current_knowledge_view.id, position }
    }

    store.dispatch(ACTIONS.specialised_object.upsert_wcomponent({ wcomponent, add_to_knowledge_view }))
    store.dispatch(ACTIONS.specialised_object.clear_selected_wcomponents({}))
    store.dispatch(ACTIONS.routing.change_route({ item_id: wcomponent.id }))
    store.dispatch(ACTIONS.display_at_created_datetime.change_display_at_created_datetime({ datetime: wcomponent.created_at }))
}
