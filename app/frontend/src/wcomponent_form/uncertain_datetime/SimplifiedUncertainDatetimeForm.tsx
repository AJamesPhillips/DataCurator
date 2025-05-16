import { date2str_auto, get_today_date } from "datacurator-core/utils/date_helpers"

import { get_uncertain_datetime } from "../../shared/uncertainty/datetime"
import { Button } from "../../sharedf/Button"
import type { StateValueAndPredictionsSet } from "../../wcomponent/interfaces/state"




interface SimplifiedUncertainDatetimeFormProps
{
    VAP_set: StateValueAndPredictionsSet
    on_change: (VAP_set: StateValueAndPredictionsSet) => void
}
export function SimplifiedUncertainDatetimeForm (props: SimplifiedUncertainDatetimeFormProps)
{
    const { VAP_set, on_change } = props

    const entry = VAP_set.entries[0]

    if (!entry) return null


    const datetime = get_uncertain_datetime(VAP_set.datetime)
    const is_eternal = datetime === undefined


    return <div>
        {datetime ? date2str_auto({ date: datetime, time_resolution: undefined }) : "Is Eternal"}
        <br />

        {is_eternal && <Button
            value="Set to 'From today'"
            onClick={() => on_change({ ...VAP_set, datetime: { value: get_today_date() } })}
        />}

        {!is_eternal && <Button
            value="Set to Eternal"
            onClick={() => on_change({ ...VAP_set, datetime: {} })}
        />}

        <br /><br />
    </div>
}
