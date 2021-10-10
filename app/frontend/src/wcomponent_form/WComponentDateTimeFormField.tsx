import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { HasUncertainDatetime } from "../shared/uncertainty/interfaces"
import type { WComponent } from "../wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"
import { UncertainDateTimeForm } from "./uncertain_datetime/UncertainDateTimeForm"



interface OwnProps
{
    wcomponent: Partial<HasUncertainDatetime>
    upsert_wcomponent: (partial_wcomponent: Partial<WComponent>) => void
}



const map_state = (state: RootState) => ({
    creation_context_state: state.creation_context,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentDateTimeFormField (props: Props)
{
    const { wcomponent, creation_context_state, upsert_wcomponent } = props
    const datetime = wcomponent.datetime || {}


    return <p>
        <UncertainDateTimeForm
            datetime={datetime}
            on_change={datetime => upsert_wcomponent({ datetime }) }
        />
    </p>
}

export const WComponentDateTimeFormField = connector(_WComponentDateTimeFormField) as FunctionalComponent<OwnProps>
