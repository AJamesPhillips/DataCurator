import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { WComponentType } from "../shared/models/interfaces/wcomponent"
import { Button } from "../sharedf/Button"
import type { RootState } from "../state/State"
import "./CreateNewWComponent.css"
import { create_wcomponent } from "./create_wcomponent_type"



const map_state = (state: RootState) => ({
    a_selected_wcomponent_id: state.meta_wcomponents.selected_wcomponent_ids_list[0] || "",
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>


function _CreateNewWComponent (props: Props)
{
    return <div class="create_mew_wcomponent">
        <p>
            Create new component
        </p>
        <i>(Will also add to current knowledge view)</i>

        <Button
            value="Create Node (process)"
            extra_class_names="creation_option left"
            size="normal"
            on_pointer_down={() => create_wcomponent_type("process")}
        />
        <Button
            value="Create Node (statement / simple state)"
            extra_class_names="creation_option left"
            size="normal"
            on_pointer_down={() => create_wcomponent_type("state")}
        />
        <Button
            value="Create Node (complex state)"
            extra_class_names="creation_option left"
            size="normal"
            on_pointer_down={() => create_wcomponent_type("statev2")}
        />
        <Button
            value="Create Judgement"
            extra_class_names="creation_option left"
            size="normal"
            on_pointer_down={() => create_wcomponent({
                type: "judgement",
                judgement_target_wcomponent_id: props.a_selected_wcomponent_id,
            })}
        />
        <Button
            value="Create Connection (causal link)"
            extra_class_names="creation_option left"
            size="normal"
            on_pointer_down={() => create_wcomponent_type("causal_link")}
        />
    </div>
}

export const CreateNewWComponent = connector(_CreateNewWComponent) as FunctionalComponent<{}>



function create_wcomponent_type (type: WComponentType)
{
    create_wcomponent({ type })
}
