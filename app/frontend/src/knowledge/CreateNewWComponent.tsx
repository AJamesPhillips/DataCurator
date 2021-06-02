import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import type { CreationContextState } from "../shared/creation_context/state"

import { WComponentType, wcomponent_types } from "../shared/wcomponent/interfaces/wcomponent_base"
import { Button } from "../sharedf/Button"
import { get_current_UI_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import "./CreateNewWComponent.css"
import { create_wcomponent } from "./create_wcomponent_type"



const map_state = (state: RootState) => ({
    // a_selected_wcomponent_id: state.meta_wcomponents.selected_wcomponent_ids_list[0] || "",
    creation_context: state.creation_context,
    current_knowledge_view: get_current_UI_knowledge_view_from_state(state),
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>


function _CreateNewWComponent (props: Props)
{
    const {
        // a_selected_wcomponent_id: judgement_target_wcomponent_id,
        creation_context,
        current_knowledge_view,
    } = props


    if (!current_knowledge_view) return <div class="create_mew_wcomponent">
        <h3>
            Create new component
        </h3>

        Please select a knowledge view first
    </div>


    const exclude: Set<WComponentType> = new Set(["counterfactual"])
    const types = wcomponent_types.filter(t => !exclude.has(t))

    return <div class="create_mew_wcomponent">
        <h3>
            Create new component
        </h3>

        {types.map(type => <Button
            value={type}
            extra_class_names="creation_option left"
            size="normal"
            on_pointer_down={() => create_wcomponent_type(type, creation_context)}
        />)}
    </div>
}

export const CreateNewWComponent = connector(_CreateNewWComponent) as FunctionalComponent<{}>



function create_wcomponent_type (type: WComponentType, creation_context: CreationContextState)
{
    create_wcomponent({ wcomponent: { type }, creation_context })
}
