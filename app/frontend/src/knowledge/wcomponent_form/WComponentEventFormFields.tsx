import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_created_ats } from "../../shared/utils/datetime"
import type { WComponentNodeEvent } from "../../shared/wcomponent/interfaces/event"
import type { WComponent } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../../state/State"
import { UncertainDateTime } from "../uncertainty/datetime"



interface OwnProps
{
    wcomponent: WComponentNodeEvent
    upsert_wcomponent: (partial_wcomponent: Partial<WComponent>) => void
}



const map_state = (state: RootState) => ({
    creation_context_state: state.creation_context,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentEventFormFields (props: Props)
{
    const { wcomponent, creation_context_state, upsert_wcomponent } = props
    const event_at = wcomponent.event_at && wcomponent.event_at[0]


    return <p>
        <UncertainDateTime
            // Get a hacky implementation of event datetime
            datetime={event_at ? event_at.datetime : {}}
            on_change={datetime =>
            {
                const partial_wcomponent: Partial<WComponentNodeEvent> =
                {
                    event_at: [{
                        ...(event_at || { ...get_created_ats(creation_context_state) }),
                        id: "",
                        explanation: "",
                        probability: 1,
                        conviction: 1,
                        datetime,
                    }]
                }
                upsert_wcomponent(partial_wcomponent)
            }}
        />
    </p>
}

export const WComponentEventFormFields = connector(_WComponentEventFormFields) as FunctionalComponent<OwnProps>
