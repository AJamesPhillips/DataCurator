import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { EditableCustomDateTime } from "../form/EditableCustomDateTime"
import { EditableText } from "../form/editable_text/EditableText"
import type { Perception } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { ConfirmatoryDeleteButton } from "../form/ConfirmatoryDeleteButton"



interface OwnProps {
    perception: Perception
}

const map_state = (state: RootState) =>
{
    return {
        ready: state.sync.ready_for_reading,
    }
}


const map_dispatch = {
    upsert_perception: ACTIONS.specialised_object.upsert_perception,
    delete_perception: ACTIONS.specialised_object.delete_perception,
}


const connector = connect(map_state, map_dispatch)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _PerceptionForm (props: Props)
{
    if (!props.ready) return <div>Loading...</div>

    const { perception } = props
    const perception_id = perception.id

    const upsert_perception = (args: Partial<Perception>) =>
        props.upsert_perception({ perception: { ...perception, ...args } })


    return <div key={perception_id}>
        <h2><EditableText
            placeholder="Title..."
            value={perception.title}
            conditional_on_change={title => upsert_perception({ title })}
        /></h2>

        <p><EditableText
            placeholder="Description..."
            value={perception.description}
            conditional_on_change={description => upsert_perception({ description })}
        /></p>

        <p title={(perception.custom_created_at ? "Custom " : "") + "Created at"}>
            <EditableCustomDateTime
                invariant_value={perception.created_at}
                value={perception.custom_created_at}
                on_change={new_custom_created_at => upsert_perception({ custom_created_at: new_custom_created_at })}
            />
        </p>

        <hr />

        <ConfirmatoryDeleteButton on_delete={() => props.delete_perception({ perception_id })} />

    </div>
}


export const PerceptionForm = connector(_PerceptionForm) as FunctionComponent<OwnProps>
