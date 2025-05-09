import AddIcon from "@mui/icons-material/Add"
import { FunctionalComponent } from "preact"

import { useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import { get_next_available_wc_map_position } from "../knowledge_view/utils/next_wc_map_position"
import { KnowledgeViewWComponentIdEntryMap } from "../shared/interfaces/knowledge_view"
import { Button } from "../sharedf/Button"
import { CreationContextState } from "../state/creation_context/state"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import { create_wcomponent } from "../state/specialised_objects/wcomponents/create_wcomponent_type"
import type { RootState } from "../state/State"
import { selector_chosen_base_id } from "../state/user_info/selector"
import { update_value_possibilities_with_VAPSets } from "../wcomponent/CRUD_helpers/update_possibilities_with_VAPSets"
import type { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import type { StateValueAndPredictionsSet } from "../wcomponent/interfaces/state"
import { ACTION_VALUE_POSSIBILITY_ID } from "../wcomponent/value/parse_value"
import { set_action_VAP_set_state } from "../wcomponent_form/values_and_predictions/handle_update_VAP_sets"
import "./AddNewActionButton.scss"



type ListTypeType = "icebox" | "todo" | "in_progress" | "done"

interface OwnProps
{
    most_recent_action_id: string
    list_type: ListTypeType
}



const map_state = (state: RootState) => ({
    creation_context: state.creation_context,
    composed_knowledge_view: get_current_composed_knowledge_view_from_state(state),
    wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    base_id: selector_chosen_base_id(state),
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _AddNewActionButton (props: Props)
{
    const {
        most_recent_action_id, composed_knowledge_view, wcomponents_by_id,
        base_id, list_type, creation_context
    } = props

    if (!composed_knowledge_view) return null
    const { id: knowledge_view_id, composed_wc_id_map } = composed_knowledge_view


    const handle_click = useMemo(() => make_handle_click({
        base_id,
        composed_wc_id_map,
        most_recent_action_id,
        wcomponents_by_id,
        list_type,
        creation_context,
        knowledge_view_id,
    }), [
        base_id,
        composed_wc_id_map,
        most_recent_action_id,
        wcomponents_by_id,
        list_type,
        creation_context,
        knowledge_view_id,
    ])


    return <Button
        className="add_new_action_button"
        fullWidth={false}
        onClick={handle_click}
        disabled={base_id === undefined}
        title={base_id === undefined ? "No knowledge base selected" : ""}
    >
        <AddIcon />
    </Button>
}

export const AddNewActionButton = connector(_AddNewActionButton) as FunctionalComponent<OwnProps>



interface MakeHandleClickArgs
{
    base_id: number | undefined
    composed_wc_id_map: KnowledgeViewWComponentIdEntryMap
    most_recent_action_id: string
    wcomponents_by_id: WComponentsById
    list_type: ListTypeType
    creation_context: CreationContextState
    knowledge_view_id: string
}

function make_handle_click (args: MakeHandleClickArgs)
{
    const {
        base_id,
        composed_wc_id_map,
        most_recent_action_id,
        wcomponents_by_id,
        list_type,
        creation_context,
        knowledge_view_id,
    } = args

    return function handle_click ()
    {
        if (base_id === undefined) throw new Error(`No base_id defined in click for AddNewActionButton`)

        const next_action_position = get_next_available_wc_map_position(composed_wc_id_map, most_recent_action_id, wcomponents_by_id)

        let values_and_prediction_sets: StateValueAndPredictionsSet[] = []

        const is_todo = list_type === "todo"
        const is_in_progress = list_type === "in_progress"
        const is_done = list_type === "done"


        if (is_in_progress || is_done)
        {
            values_and_prediction_sets = set_action_VAP_set_state({
                existing_value_possibilities: undefined,
                orig_values_and_prediction_sets: [],
                base_id,
                creation_context,
                action_value_possibility_id: ACTION_VALUE_POSSIBILITY_ID.action_in_progress,
            })

            if (is_done)
            {
                // Set start time to one hour in past
                let datetime = new Date()
                const one_hour_in_milliseconds = 3600 * 1000
                datetime = new Date(datetime.getTime() - one_hour_in_milliseconds)
                values_and_prediction_sets[0]!.datetime.value = datetime
            }
        }


        if (is_done)
        {
            values_and_prediction_sets = set_action_VAP_set_state({
                existing_value_possibilities: undefined,
                orig_values_and_prediction_sets: values_and_prediction_sets,
                base_id,
                creation_context,
                action_value_possibility_id: ACTION_VALUE_POSSIBILITY_ID.action_completed,
            })
        }


        const value_possibilities = update_value_possibilities_with_VAPSets(undefined, values_and_prediction_sets)


        create_wcomponent({
            wcomponent: {
                base_id,
                type: "action",
                values_and_prediction_sets,
                value_possibilities,
                todo_index: is_todo ? new Date().getTime() : undefined,
            },
            add_to_knowledge_view: {
                id: knowledge_view_id,
                position: next_action_position,
            }
        })
    }
}
