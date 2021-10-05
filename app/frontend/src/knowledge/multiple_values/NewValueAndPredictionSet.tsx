import { h } from "preact"
import { useState } from "preact/hooks"

import { AutocompleteText } from "../../form/Autocomplete/AutocompleteText"
import type { ListItemCRUDRequiredU } from "../../form/editable_list/EditableListEntry"
import { get_uncertain_datetime } from "../../shared/uncertainty/datetime"
import { date2str_auto, get_today_date } from "../../shared/utils/date_helpers"
import { VAPsType } from "../../shared/wcomponent/interfaces/generic_value"
import type { ValuePossibilitiesById } from "../../shared/wcomponent/interfaces/possibility"
import type { StateValueAndPredictionsSet } from "../../shared/wcomponent/interfaces/state"
import {
    ACTION_OPTIONS,
    get_action_status_of_VAP_set,
} from "../../shared/wcomponent/value_and_prediction/actions_value"
import { Button } from "../../sharedf/Button"
import {
    get_details2_for_single_VAP_set,
    get_details_for_single_VAP_set,
    get_summary_for_single_VAP_set,
} from "./common"



export const new_value_and_prediction_set = (VAPs_represent: VAPsType, value_possibilities: ValuePossibilitiesById | undefined) =>
{
    const boolean_or_action = VAPs_represent === VAPsType.boolean || VAPs_represent === VAPsType.action
    // I do not understand why this works as it occurs after a conditional in NewItemForm
    const [show_advanced, set_show_advanced] = useState(!boolean_or_action)
    // useEffect(() => {}, [VAPs_represent])

    return (VAP_set: StateValueAndPredictionsSet, crud: ListItemCRUDRequiredU<StateValueAndPredictionsSet>) =>
    {
        const { update_item } = crud

        return <div>
            {VAPs_represent === VAPsType.boolean && <SimplifiedBooleanForm VAP_set={VAP_set} on_change={update_item} />}
            {VAPs_represent === VAPsType.action && <SimplifiedActionForm value_possibilities={value_possibilities} VAP_set={VAP_set} on_change={update_item} />}

            <SimplifiedDatetimeForm VAP_set={VAP_set} on_change={update_item} />

            <Button
                value={(show_advanced ? "Hide" : "Show") + " advanced options"}
                onClick={() => set_show_advanced(!show_advanced)}
            />

            {show_advanced && <div>
                <br />
                <br />
                <hr />

                {get_summary_for_single_VAP_set(VAPs_represent, false)(VAP_set, crud)}
                {get_details_for_single_VAP_set(value_possibilities, VAPs_represent)(VAP_set, crud)}
                {get_details2_for_single_VAP_set(VAPs_represent, true)(VAP_set, crud)}
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
        {is_true && "True"}
        {is_false && "False"}
        <br />
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
    value_possibilities: ValuePossibilitiesById | undefined
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

                const entries = VAP_set.entries.map(VAP =>
                {
                    const probability = VAP.value === new_status ? 1 : 0
                    return {
                        ...VAP,
                        relative_probability: probability,
                        probability: probability,
                        conviction: 1,
                    }
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
