import { h } from "preact"
import { useState } from "preact/hooks"
import { Box } from "@material-ui/core"

import "../../form/editable_list/EditableListEntry.css"
import { Button } from "../../sharedf/Button"
import { get_items_by_id } from "../../shared/utils/get_items"
import { VAPsType } from "../../shared/wcomponent/interfaces/generic_value"
import type { ValuePossibilitiesById, ValuePossibility } from "../../shared/wcomponent/interfaces/possibility"
import { ValuePossibilityComponent } from "./ValuePossibilityComponent"
import { default_possible_values } from "./value_possibilities/default_possible_values"
import { prepare_new_value_possibility } from "./value_possibilities/prepare_new_value_possibility"



interface OwnProps
{
    editing: boolean
    VAPs_represent: VAPsType
    value_possibilities: ValuePossibilitiesById | undefined
    update_value_possibilities: (value_possibilities: ValuePossibilitiesById | undefined) => void
}


export function ValuePossibilitiesComponent (props: OwnProps)
{
    const [show_value_possibilities, set_show_value_possibilities] = useState(false)

    const value_possibilities_list = value_possibilities_as_list(props.value_possibilities)
    const all_values = all_possible_values(value_possibilities_list)


    if (props.VAPs_represent === VAPsType.boolean) return null


    // Note: `editable_list_entry` makes no semantic sense here, only using to get the
    // CSS styles applied for `expansion_button`.
    const class_name = `editable_list_entry ${show_value_possibilities ? "expanded" : ""}`

    return <div className={class_name}>
        <div className="summary_header">
            <div className="summary">
                <h4>Possible Values {!show_value_possibilities && `(${value_possibilities_list.length})`}</h4>
            </div>

            <div
                className="expansion_button"
                onClick={() => set_show_value_possibilities(!show_value_possibilities)}
            />
        </div>

        {show_value_possibilities && <div>
            <Box display="flex" flexDirection="row" flexWrap="wrap" overflow="hidden">
                {value_possibilities_list.map(value_possibility => <ValuePossibilityComponent
                    editing={props.editing}
                    value_possibility={value_possibility}
                    existing_values={all_values}
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

            <Button
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
            />

            {props.value_possibilities === undefined && <Button
                value="Use defaults"
                fullWidth={true}
                onClick={() =>
                {
                    const possible_values = default_possible_values(props.VAPs_represent, [])
                    const value_possibilities = get_items_by_id(possible_values, "default_possible_values")
                    props.update_value_possibilities(value_possibilities)
                }}
            />}
        </div>}
    </div>
}



function all_possible_values (value_possibilities: ValuePossibility[]): Set<string>
{
    const all_values = new Set(value_possibilities.map(({ value }) => value.toLowerCase()))

    return all_values
}



function value_possibilities_as_list (value_possibilities: ValuePossibilitiesById | undefined): ValuePossibility[]
{
    return Object.values(value_possibilities || {})
        .sort((a, b) => a.order < b.order ? -1 : 1)
}
