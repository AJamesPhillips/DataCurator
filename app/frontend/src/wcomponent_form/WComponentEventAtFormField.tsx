import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_new_created_ats } from "../shared/utils/datetime"
import type { EventAt } from "../wcomponent/interfaces/event"
import type { WComponent } from "../wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"
import { selector_chosen_base_id } from "../state/user_info/selector"
import { UncertainDateTime } from "../knowledge/uncertainty/datetime"



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


    return <p>
        <UncertainDateTime
            // Get a hacky implementation of event datetime
            datetime={event_at ? event_at.datetime : {}}
            on_change={datetime =>
            {
                const partial_wcomponent: EventAt =
                {
                    event_at: [{
                        ...(event_at || { ...get_new_created_ats(creation_context_state) }),
                        id: "",
                        base_id: base_id || -1, // base id should be present but default to -1 just in case
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

export const WComponentEventAtFormField = connector(_WComponentEventAtFormField) as FunctionalComponent<OwnProps>
