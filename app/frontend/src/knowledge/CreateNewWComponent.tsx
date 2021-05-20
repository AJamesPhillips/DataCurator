import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import type { CreationContextState } from "../shared/interfaces"

import type { WComponentType } from "../shared/wcomponent/interfaces/wcomponent"
import { Button } from "../sharedf/Button"
import type { RootState } from "../state/State"
import "./CreateNewWComponent.css"
import { create_wcomponent } from "./create_wcomponent_type"



const map_state = (state: RootState) => ({
    a_selected_wcomponent_id: state.meta_wcomponents.selected_wcomponent_ids_list[0] || "",
    creation_context: state.creation_context,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>


function _CreateNewWComponent (props: Props)
{
    const { creation_context } = props

    return <div class="create_mew_wcomponent">
        <p>
            Create new component
        </p>
        <i>(Will also add to current knowledge view)</i>

        <Button
            value="Create Node (process)"
            extra_class_names="creation_option left"
            size="normal"
            on_pointer_down={() => create_wcomponent_type("process", creation_context)}
        />
        <Button
            value="Create Node (statement / simple state)"
            extra_class_names="creation_option left"
            size="normal"
            on_pointer_down={() => create_wcomponent_type("state", creation_context)}
        />
        <Button
            value="Create Node (complex state)"
            extra_class_names="creation_option left"
            size="normal"
            on_pointer_down={() => create_wcomponent_type("statev2", creation_context)}
        />
        <Button
            value="Create Judgement"
            extra_class_names="creation_option left"
            size="normal"
            on_pointer_down={() => create_wcomponent({
                type: "judgement",
                judgement_target_wcomponent_id: props.a_selected_wcomponent_id,
            }, creation_context)}
        />
        <Button
            value="Create Connection (causal link)"
            extra_class_names="creation_option left"
            size="normal"
            on_pointer_down={() => create_wcomponent_type("causal_link", creation_context)}
        />
    </div>
}

export const CreateNewWComponent = connector(_CreateNewWComponent) as FunctionalComponent<{}>



function create_wcomponent_type (type: WComponentType, creation_context: CreationContextState)
{
    create_wcomponent({ type }, creation_context)
}
