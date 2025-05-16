import type { HasUncertainDatetime } from "../shared/uncertainty/interfaces"
import type { WComponent } from "../wcomponent/interfaces/SpecialisedObjects"
import { UncertainDateTimeForm } from "./uncertain_datetime/UncertainDateTimeForm"



interface OwnProps
{
    wcomponent: Partial<HasUncertainDatetime>
    upsert_wcomponent: (partial_wcomponent: Partial<WComponent>) => void
}


export function WComponentDateTimeFormField (props: OwnProps)
{
    const { wcomponent, upsert_wcomponent } = props
    const datetime = wcomponent.datetime || {}


    return <p>
        <UncertainDateTimeForm
            datetime={datetime}
            on_change={datetime => upsert_wcomponent({ datetime }) }
        />
    </p>
}
