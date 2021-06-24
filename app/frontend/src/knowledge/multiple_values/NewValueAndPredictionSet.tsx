import { h } from "preact"
import { useState } from "preact/hooks"
import { uncertain_datetime_is_eternal } from "../../form/datetime_utils"
import { get_today_date } from "../../shared/utils/date_helpers"

import type { VAPsRepresent } from "../../shared/wcomponent/interfaces/generic_value"
import type { StateValueAndPredictionsSet } from "../../shared/wcomponent/interfaces/state"
import { Button } from "../../sharedf/Button"
import { get_details2_for_single_VAP_set, get_details_for_single_VAP_set, get_summary_for_single_VAP_set } from "./common"



export const new_value_and_prediction_set = (VAPs_represent: VAPsRepresent) =>
{
    // I do not understand why this works as it occurs after a conditional in NewItemForm
    const [show_advanced, set_show_advanced] = useState(false)

    return (VAP_set: StateValueAndPredictionsSet, on_change: (item: StateValueAndPredictionsSet) => void) =>
{

    if (!VAPs_represent.boolean)
    {
        return <div>
            {get_summary_for_single_VAP_set(VAPs_represent, false, undefined)(VAP_set, on_change)}
            {get_details_for_single_VAP_set(VAPs_represent)(VAP_set, on_change)}
            {get_details2_for_single_VAP_set(VAPs_represent, true)(VAP_set, on_change)}
        </div>
    }


    const entry = VAP_set.entries.length === 1 && VAP_set.entries[0]
    const is_true = !!entry && entry.probability === 1 && entry.conviction === 1
    const is_false = !!entry && entry.probability === 0 && entry.conviction === 1

    const is_eternal = uncertain_datetime_is_eternal(VAP_set.datetime)

    return <div>
        Set to <br />
        {entry && !is_true && <Button
            value="Set to True"
            onClick={() =>
            {
                on_change({ ...VAP_set, entries: [{ ...entry, probability: 1, conviction: 1 }] })
            }}
        />}
        {entry && !is_false && <Button
            value="Set to False"
            onClick={() => {
                on_change({ ...VAP_set, entries: [{ ...entry, probability: 0, conviction: 1 }] })
            }}
        />}

        <br /><br />

        {entry && is_eternal && <Button
            value="Set to 'From today'"
            onClick={() => on_change({ ...VAP_set, datetime: { min: get_today_date() } })}
        />}

        {entry && !is_eternal && <Button
            value="Set to Eternal"
            onClick={() => on_change({ ...VAP_set, datetime: {} })}
        />}

        <br /><br />

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
