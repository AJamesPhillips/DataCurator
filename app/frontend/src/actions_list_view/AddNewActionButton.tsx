import { FunctionalComponent, h } from "preact"
import AddIcon from "@material-ui/icons/Add"

import "./AddNewActionButton.scss"
import type { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import { Button } from "../sharedf/Button"
import { create_wcomponent } from "../state/specialised_objects/wcomponents/create_wcomponent_type"
import type { ComposedKnowledgeView } from "../state/derived/State"
import { get_next_available_wc_map_position } from "../knowledge_view/utils/next_wc_map_position"
import type { StateValueAndPredictionsSet } from "../wcomponent/interfaces/state"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../state/State"
import { set_action_VAP_set_state } from "../wcomponent_form/values_and_predictions/handle_update_VAP_sets"
import { ACTION_VALUE_POSSIBILITY_ID } from "../wcomponent/value/parse_value"
import { update_value_possibilities_with_VAPSets } from "../wcomponent/CRUD_helpers/update_possibilities_with_VAPSets"



interface OwnProps
{
    most_recent_action_id: string
    composed_knowledge_view: ComposedKnowledgeView | undefined
    wcomponents_by_id: WComponentsById
    base_id: number
    list_type: "icebox" | "todo" | "in_progress" | "done"
}



const map_state = (state: RootState) => ({
    creation_context: state.creation_context,
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


    function handle_click ()
    {
        const next_action_position = get_next_available_wc_map_position(composed_wc_id_map, most_recent_action_id, wcomponents_by_id) || { left: 0, top: 0 }

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


    return <Button className="add_new_action_button" fullWidth={false} onClick={e => handle_click()}>
        <AddIcon />
    </Button>
}

export const AddNewActionButton = connector(_AddNewActionButton) as FunctionalComponent<OwnProps>
