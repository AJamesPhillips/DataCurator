import { h } from "preact"
import { useState } from "preact/hooks"

import { AutocompleteText } from "../../form/Autocomplete/AutocompleteText"
import type { AutocompleteOption } from "../../form/Autocomplete/interfaces"
import type { ListItemCRUDRequiredU } from "../../form/editable_list/EditableListEntry"
import { VAPsType } from "../../wcomponent/interfaces/VAPsType"
import type { ValuePossibilitiesById } from "../../wcomponent/interfaces/possibility"
import type { StateValueAndPredictionsSet } from "../../wcomponent/interfaces/state"
import { Button } from "../../sharedf/Button"
import {
    get_details2_for_single_VAP_set,
    get_details_for_single_VAP_set,
    get_summary_for_single_VAP_set,
} from "./common"
import { SimplifiedUncertainDatetimeForm } from "../uncertain_datetime/SimplifiedUncertainDatetimeForm"
import { sentence_case } from "../../shared/utils/sentence_case"
import { update_VAP_set_VAP_probabilities } from "./update_VAP_set_VAP_probabilities"



export const new_value_and_prediction_set__jsx_factory = (VAPs_represent: VAPsType, possible_value_possibilities: ValuePossibilitiesById | undefined) =>
{
    const any_value_possibilities = Object.keys(possible_value_possibilities || {}).length > 0
    const hide_advanced_for_type_other = VAPs_represent === VAPsType.other && any_value_possibilities
    const initial_hide_advanced = VAPs_represent === VAPsType.boolean || VAPs_represent === VAPsType.action || hide_advanced_for_type_other

    // I do not understand why this works as it occurs after a conditional in NewItemForm
    const [show_advanced, set_show_advanced] = useState(!initial_hide_advanced)
    // useEffect(() => {}, [VAPs_represent])

    return (VAP_set: StateValueAndPredictionsSet, crud: ListItemCRUDRequiredU<StateValueAndPredictionsSet>) =>
    {
        // if (possible_value_possibilities === undefined)
        // {
        //     possible_value_possibilities = update_value_possibilities_with_VAPSets({}, [VAP_set])
        // }

        const { update_item } = crud

        return <div>
            {!show_advanced && VAPs_represent === VAPsType.boolean && <SimplifiedBooleanForm
                VAP_set={VAP_set}
                on_change={update_item}
            />}
            {!show_advanced && VAPs_represent === VAPsType.action && <SimplifiedActionForm
                possible_value_possibilities={possible_value_possibilities}
                VAP_set={VAP_set}
                on_change={update_item}
            />}
            {!show_advanced && hide_advanced_for_type_other && <SimplifiedOtherForm
                possible_value_possibilities={possible_value_possibilities}
                VAP_set={VAP_set}
                on_change={update_item}
            />}

            {!show_advanced && <div>
                <span className="description_label">Datetime</span>
                <SimplifiedUncertainDatetimeForm
                    VAP_set={VAP_set}
                    on_change={update_item}
                />
            </div>}

            <Button
                value={(show_advanced ? "Hide" : "Show") + " advanced options"}
                onClick={() => set_show_advanced(!show_advanced)}
            />

            {show_advanced && <div>
                <br />
                <br />
                <hr />

                {get_summary_for_single_VAP_set(VAPs_represent, false)(VAP_set, crud)}
                {get_details_for_single_VAP_set(possible_value_possibilities, VAPs_represent)(VAP_set, crud)}
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
    possible_value_possibilities: ValuePossibilitiesById | undefined
    VAP_set: StateValueAndPredictionsSet
    on_change: (VAP_set: StateValueAndPredictionsSet) => void
}
function SimplifiedActionForm (props: SimplifiedActionFormProps)
{
    return <SimplifiedFormHeader {...props} title="Set action status to:" />
}



interface SimplifiedOtherFormProps
{
    possible_value_possibilities: ValuePossibilitiesById | undefined
    VAP_set: StateValueAndPredictionsSet
    on_change: (VAP_set: StateValueAndPredictionsSet) => void
}
function SimplifiedOtherForm (props: SimplifiedOtherFormProps)
{
    return <SimplifiedFormHeader {...props} title="Set value to:" />
}



interface SimplifiedFormHeaderProps
{
    title: string
    possible_value_possibilities: ValuePossibilitiesById | undefined
    VAP_set: StateValueAndPredictionsSet
    on_change: (VAP_set: StateValueAndPredictionsSet) => void
}
function SimplifiedFormHeader (props: SimplifiedFormHeaderProps)
{
    const { title, possible_value_possibilities, VAP_set, on_change } = props

    const selected_option_id = get_VAP_set_certain_selected_value_id(VAP_set)
    const options = value_possibility_options(possible_value_possibilities)

    return <div>
        {title}
        <AutocompleteText
            selected_option_id={selected_option_id}
            options={options}
            allow_none={true}
            on_change={new_status_id =>
            {
                if (!new_status_id) return

                const entries = update_VAP_set_VAP_probabilities(VAP_set, new_status_id)

                on_change({ ...VAP_set, entries })
            }}
        />

        <br /><br />
    </div>
}



function value_possibility_options (value_possibilities: ValuePossibilitiesById | undefined): AutocompleteOption[]
{
    return value_possibilities === undefined
        ? []
        : Object.values(value_possibilities).map(({ id, value }) => ({ id, title: sentence_case(value) }))
}



function get_VAP_set_certain_selected_value_id (VAP_set: StateValueAndPredictionsSet): string | undefined
{
    let value_id: string | undefined = undefined

    const conviction = VAP_set.shared_entry_values?.conviction || 0
    const probability = VAP_set.shared_entry_values?.probability || 0

    VAP_set.entries.forEach(VAP =>
    {
        if (Math.max(conviction, VAP.conviction) !== 1) return
        if (Math.max(probability, VAP.probability) !== 1) return
        value_id = VAP.value_id
    })

    return value_id
}
