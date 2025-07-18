import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { EditableTextOnBlurType } from "../form/editable_text/editable_text_common"
import { EditablePercentage } from "../form/EditablePercentage"
import type { Prediction } from "../shared/uncertainty/interfaces"
import { get_new_created_ats } from "../shared/utils/datetime"
import { Button } from "../sharedf/Button"
import { PredictionBadge } from "../sharedf/prediction_badge/PredictionBadge"
import type { RootState } from "../state/State"
import { selector_chosen_base_id } from "../state/user_info/selector"
import type { EventAt } from "../wcomponent/interfaces/event"
import type { WComponent } from "../wcomponent/interfaces/SpecialisedObjects"
import { UncertainDateTimeForm } from "./uncertain_datetime/UncertainDateTimeForm"



interface OwnProps
{
    wcomponent: Partial<EventAt>
    upsert_wcomponent: (partial_wcomponent: Partial<WComponent>) => void
}



const map_state = (state: RootState) => ({
    editing: !state.display_options.consumption_formatting,
    base_id: selector_chosen_base_id(state),
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentEventAtFormField (props: Props)
{
    const { wcomponent, upsert_wcomponent, base_id } = props
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
                ...(event_at || { ...get_new_created_ats() }),
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
                placeholder="Probability"
                value={event_at?.probability}
                on_blur={new_probability => upsert_event_at({ probability: new_probability })}
                on_blur_type={EditableTextOnBlurType.conditional}
            />
            <EditablePercentage
                placeholder="Confidence"
                value={event_at?.conviction}
                on_blur={new_conviction => upsert_event_at({ conviction: new_conviction })}
                on_blur_type={EditableTextOnBlurType.conditional}
            />
            &nbsp; {event_at && <PredictionBadge
                disabled={true}
                size={20}
                probability={event_at.probability}
                conviction={event_at.conviction}
            />}
        </div>

        <br /><br />

        {props.editing && <Button
            fullWidth={true}
            value={event_at ? "Clear Event" : "Create Default Event"}
            onClick={() =>
            {
                if (event_at) upsert_wcomponent({ event_at: [] })
                else upsert_event_at({ conviction: 1, probability: 1 })
            }}
        />}
    </p>
}

export const WComponentEventAtFormField = connector(_WComponentEventAtFormField) as FunctionalComponent<OwnProps>
