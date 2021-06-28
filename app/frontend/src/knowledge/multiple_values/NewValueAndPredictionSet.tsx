import { h } from "preact"
import { useState } from "preact/hooks"
import { AutocompleteText } from "../../form/Autocomplete/AutocompleteText"

import { uncertain_datetime_is_eternal } from "../../form/datetime_utils"
import { get_today_date } from "../../shared/utils/date_helpers"
import { VAPsType } from "../../shared/wcomponent/interfaces/generic_value"
import type { StateValueAndPredictionsSet } from "../../shared/wcomponent/interfaces/state"
import { ACTION_OPTIONS, get_action_status_of_VAP_set } from "../../shared/wcomponent/value_and_prediction/actions_value"
import { Button } from "../../sharedf/Button"
import { get_details2_for_single_VAP_set, get_details_for_single_VAP_set, get_summary_for_single_VAP_set } from "./common"
import { prepare_new_VAP_set_entries } from "./utils"



export const new_value_and_prediction_set = (VAPs_represent: VAPsType) =>
{
    // I do not understand why this works as it occurs after a conditional in NewItemForm
    const [show_advanced, set_show_advanced] = useState(false)
    // useEffect(() => {}, [VAPs_represent])

    return (VAP_set: StateValueAndPredictionsSet, on_change: (item: StateValueAndPredictionsSet) => void) =>
{

    return <div>
        {VAPs_represent === VAPsType.boolean && <SimplifiedBooleanForm VAP_set={VAP_set} on_change={on_change} />}
        {VAPs_represent === VAPsType.action && <SimplifiedActionForm VAP_set={VAP_set} on_change={on_change} />}

        {<SimplifiedDatetimeForm VAP_set={VAP_set} on_change={on_change} />}

        <Button
            value={(show_advanced ? "Hide" : "Show") + " advanced options"}
            onClick={() => set_show_advanced(!show_advanced)}
        />

        {show_advanced && <div>
            <br />
            <br />
            <hr />

            {get_summary_for_single_VAP_set(VAPs_represent, false, undefined)(VAP_set, on_change)}
            {get_details_for_single_VAP_set(VAPs_represent)(VAP_set, on_change)}
            {get_details2_for_single_VAP_set(VAPs_represent, true)(VAP_set, on_change)}
        </div>}

    </div>
}
}



interface SimplifiedBooleanFormProps
{
    VAP_set: StateValueAndPredictionsSet
    on_change: (VAP_set: StateValueAndPredictionsSet) => void
}
function SimplifiedBooleanForm (props: SimplifiedBooleanFormProps)
{
    const { VAP_set, on_change } = props

    const entry = VAP_set.entries[0]

    if (!entry) return null


    const is_true = !!entry && entry.probability === 1 && entry.conviction === 1
    const is_false = !!entry && entry.probability === 0 && entry.conviction === 1


    return <div>
        {!is_true && <Button
            value="Set to True"
            onClick={() =>
            {
                on_change({ ...VAP_set, entries: [{ ...entry, probability: 1, conviction: 1 }] })
            }}
        />}
        {!is_false && <Button
            value="Set to False"
            onClick={() => {
                on_change({ ...VAP_set, entries: [{ ...entry, probability: 0, conviction: 1 }] })
            }}
        />}

        <br /><br />
    </div>
}



interface SimplifiedActionFormProps
{
    VAP_set: StateValueAndPredictionsSet
    on_change: (VAP_set: StateValueAndPredictionsSet) => void
}
function SimplifiedActionForm (props: SimplifiedActionFormProps)
{
    const { VAP_set, on_change } = props

    const selected_option_id = get_action_status_of_VAP_set(VAP_set)

    return <div>
        Set action status to:
        <AutocompleteText
            selected_option_id={selected_option_id}
            options={ACTION_OPTIONS}
            allow_none={true}
            on_change={new_status =>
            {
                if (!new_status) return

                const entries = prepare_new_VAP_set_entries(VAPsType.action, [])
                entries.forEach(entry =>
                {
                    const probability = entry.value === new_status ? 1 : 0
                    entry.relative_probability = probability
                    entry.probability = probability
                    entry.conviction = 1
                })

                on_change({ ...VAP_set, entries })
            }}
        />

        <br /><br />
    </div>
}



interface SimplifiedDatetimeFormProps
{
    VAP_set: StateValueAndPredictionsSet
    on_change: (VAP_set: StateValueAndPredictionsSet) => void
}
function SimplifiedDatetimeForm (props: SimplifiedDatetimeFormProps)
{
    const { VAP_set, on_change } = props

    const entry = VAP_set.entries[0]

    if (!entry) return null


    const is_eternal = uncertain_datetime_is_eternal(VAP_set.datetime)


    return <div>
        {is_eternal && <Button
            value="Set to 'From today'"
            onClick={() => on_change({ ...VAP_set, datetime: { min: get_today_date() } })}
        />}

        {!is_eternal && <Button
            value="Set to Eternal"
            onClick={() => on_change({ ...VAP_set, datetime: {} })}
        />}

        <br /><br />
    </div>
}
