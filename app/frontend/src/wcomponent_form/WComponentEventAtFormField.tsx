import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_new_created_ats } from "../shared/utils/datetime"
import type { EventAt } from "../wcomponent/interfaces/event"
import type { WComponent } from "../wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"
import { selector_chosen_base_id } from "../state/user_info/selector"
import { UncertainDateTimeForm } from "./uncertain_datetime/UncertainDateTimeForm"
import { EditablePercentage } from "../form/EditablePercentage"
import type { Prediction } from "../shared/uncertainty/interfaces"
import { PredictionBadge } from "../sharedf/prediction_badge/PredictionBadge"



interface OwnProps
{
    wcomponent: Partial<EventAt>
    upsert_wcomponent: (partial_wcomponent: Partial<WComponent>) => void
}



const map_state = (state: RootState) => ({
    creation_context_state: state.creation_context,
    base_id: selector_chosen_base_id(state),
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentEventAtFormField (props: Props)
{
    const { wcomponent, creation_context_state, upsert_wcomponent, base_id } = props
    const event_at = wcomponent.event_at && wcomponent.event_at[0]


    const upsert_event_at = (partial_event_at_prediction: Partial<Prediction>) =>
    {
        const partial_wcomponent: EventAt =
        {
            event_at: [{
                probability: 1,
                conviction: 1,
                datetime: {},
                id: "",
                base_id: base_id || -1, // base id should be present but default to -1 just in case
                explanation: "",
                ...(event_at || { ...get_new_created_ats(creation_context_state) }),
                ...partial_event_at_prediction,
            }]
        }
        upsert_wcomponent(partial_wcomponent)
    }


    return <p>
        <UncertainDateTimeForm
            // Get a hacky implementation of event datetime
            datetime={event_at ? event_at.datetime : {}}
            on_change={datetime => upsert_event_at({ datetime })}
        />
        <br />
        <div style={{ display: "inline-flex" }}>
            <EditablePercentage
                placeholder="Confidence"
                value={event_at?.conviction}
                conditional_on_blur={new_conviction => upsert_event_at({ conviction: new_conviction })}
            />
            <EditablePercentage
                placeholder="Probability"
                value={event_at?.probability}
                conditional_on_blur={new_probability => upsert_event_at({ probability: new_probability })}
            />
            &nbsp; {event_at && <PredictionBadge
                disabled={true}
                size={20}
                probability={event_at.probability}
                conviction={event_at.conviction}
            />}
        </div>
    </p>
}

export const WComponentEventAtFormField = connector(_WComponentEventAtFormField) as FunctionalComponent<OwnProps>
