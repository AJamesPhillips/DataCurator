import { useState } from "preact/hooks"
import { Box } from "@mui/material"

import "../../form/editable_list/EditableListEntry.css"
import { Button } from "../../sharedf/Button"
import { get_items_by_id } from "../../shared/utils/get_items"
import { VAPsType } from "../../wcomponent/interfaces/VAPsType"
import type { ValuePossibilitiesById, ValuePossibility } from "../../wcomponent/interfaces/possibility"
import { ValuePossibilityComponent } from "./ValuePossibilityComponent"
import {
    prepare_new_value_possibility,
} from "../../wcomponent/CRUD_helpers/prepare_new_value_possibility"
import { WarningTriangleV2 } from "../../sharedf/WarningTriangleV2"
import type { StateValueAndPredictionsSet as VAPSet } from "../../wcomponent/interfaces/state"
import {
    get_possibilities_from_VAP_sets,
} from "../../wcomponent/value_possibilities/get_possibilities_from_VAP_sets"
import { WComponent, wcomponent_is_statev2 } from "../../wcomponent/interfaces/SpecialisedObjects"
import { get_wcomponent_VAPs_represent } from "../../wcomponent/get_wcomponent_VAPs_represent"



interface OwnProps
{
    editing: boolean
    attribute_wcomponent: WComponent | undefined
    VAPs_represent: VAPsType
    value_possibilities: ValuePossibilitiesById | undefined
    values_and_prediction_sets: VAPSet[]
    update_value_possibilities: (value_possibilities: ValuePossibilitiesById | undefined) => void
}


export function WComponentValuePossibilitiesForm (props: OwnProps)
{
    const value_possibilities_list = value_possibilities_as_list(props.value_possibilities)
    const [show_form, set_show_form] = useState(value_possibilities_list.length > 0)

    if (props.VAPs_represent === VAPsType.undefined) return null


    const { count_of_value_possibilities, max_count } = get_count_of_value_possibilities(value_possibilities_list)
    const warning = max_count > 1 ? "Duplicate value possibilities present" : ""


    // Note: I do not think `editable_list_entry` makes semantic sense here. We're
    // only using it to get the CSS styles applied for `expansion_button`.
    const class_name = `editable_list_entry padded ${show_form ? "expanded" : ""}`


    const { attribute_wcomponent } = props


    return <div className={class_name}>
        <div
            className="summary_header"
            style={{ cursor: "pointer" }}
            onClick={() => set_show_form(!show_form)}
        >
            <div className="summary">
                <h4 style={{ display: "inline-block" }}>
                    Possible Values {(!show_form && value_possibilities_list.length) ? `(${value_possibilities_list.length})` : ""}
                </h4>
                <div style={{ display: "inline-block", position: "relative", top: 7, left: 5 }}>
                    <WarningTriangleV2 warning={warning} label="" />
                </div>
            </div>

            <div className="expansion_button"/>
        </div>

        {/* We could use <div className="details"> here but MUI is slow so want to minimise risks, see #214 */}
        {show_form && <div>
            <Box display="flex" flexDirection="row" flexWrap="wrap" overflow="hidden">
                {value_possibilities_list.map(value_possibility => <ValuePossibilityComponent
                    editing={props.editing}
                    value_possibility={value_possibility}
                    count_of_value_possibilities={count_of_value_possibilities}
                    update_value_possibility={new_value_possibility => {
                        const modified_value_possibilities = { ...props.value_possibilities }

                        if (!new_value_possibility)
                        {
                            delete modified_value_possibilities[value_possibility.id]
                        }
                        else
                        {
                            modified_value_possibilities[new_value_possibility.id] = new_value_possibility
                        }

                        const any_left = Object.keys(modified_value_possibilities).length > 0
                        props.update_value_possibilities(any_left ? modified_value_possibilities : undefined)
                    }}
                />)}
            </Box>

            {props.editing && <Button
                value="New possibility"
                fullWidth={true}
                onClick={() =>
                {
                    const new_value_possibility = prepare_new_value_possibility(props.value_possibilities)
                    const modified_value_possibilities = {
                        ...props.value_possibilities,
                        [new_value_possibility.id]: new_value_possibility,
                    }
                    props.update_value_possibilities(modified_value_possibilities)
                }}
            />}

            {props.editing && <Button
                value="Use defaults"
                fullWidth={true}
                onClick={() =>
                {
                    const possible_values = get_possibilities_from_VAP_sets(props.VAPs_represent, undefined, props.values_and_prediction_sets)
                    const value_possibilities = get_items_by_id(possible_values, "default_possible_values")
                    props.update_value_possibilities(value_possibilities)
                }}
            />}

            {props.editing && attribute_wcomponent && wcomponent_is_statev2(attribute_wcomponent) && <Button
                value="Use attribute's possibilities"
                fullWidth={true}
                onClick={() =>
                {
                    const possible_values = get_possibilities_from_VAP_sets(props.VAPs_represent, attribute_wcomponent.value_possibilities, attribute_wcomponent.values_and_prediction_sets || [])
                    const value_possibilities = get_items_by_id(possible_values, "attribute's possible_values")
                    props.update_value_possibilities(value_possibilities)
                }}
            />}
        </div>}
    </div>
}



function get_count_of_value_possibilities (value_possibilities: ValuePossibility[])
{
    const count_of_value_possibilities: {[value: string]: number} = {}
    let max_count = 0

    value_possibilities.forEach(({ value: value }) =>
    {
        value = value.toLowerCase()
        const count = (count_of_value_possibilities[value] || 0) + 1
        count_of_value_possibilities[value] = count
        max_count = Math.max(max_count, count)
    })

    return { count_of_value_possibilities, max_count }
}



function value_possibilities_as_list (value_possibilities: ValuePossibilitiesById | undefined): ValuePossibility[]
{
    return Object.values(value_possibilities || {})
        .sort((a, b) => a.order < b.order ? -1 : 1)
}
