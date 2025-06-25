import { Box } from "@mui/material"
import { FunctionalComponent } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { PlainCalculationObject } from "../../calculations/interfaces"
import { perform_calculations } from "../../calculations/perform_calculations"
import { Button } from "../../sharedf/Button"
import type { RootState } from "../../state/State"
import { index_is_in_bounds, insert_element_at_index, swap_elements } from "../../utils/list"
import { WComponentCalculations } from "../../wcomponent/interfaces/wcomponent_base"
import { EditableCalculationRow } from "./EditableCalculationRow"
import { EditableCalculationRowCommands } from "./EditableCalculationRowOptions"
import { get_valid_calculation_name_id } from "./get_valid_calculation_name_id"



interface OwnProps
{
    wcomponent: Partial<WComponentCalculations>
    upsert_wcomponent: (partial_wcomponent: Partial<WComponentCalculations>) => void
}


const map_state = (state: RootState) =>
{
    return {
        editing: !state.display_options.consumption_formatting,
        wcomponents_by_id: state.derived.composed_wcomponents_by_id,
    }
}


const map_dispatch = {
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentCalculatonsForm (props: Props)
{
    const {
        wcomponent,
        wcomponents_by_id,
    } = props

    const { calculations = [], calculation_custom_units = [] } = wcomponent

    // TODO remove this line.
    // We added calculation.id slightly later so for the 3-5 components that
    // have calculations without ids this line will ensure they all have one.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    calculations.forEach((calc, index) => calc.id = calc.id ?? index)

    const [show_form, set_show_form] = useState(calculations.length > 0)
    const initial_show_calc_options: {[id: number]: boolean} = {}
    calculations.forEach(calc => initial_show_calc_options[calc.id] = false)
    const [show_calc_options, set_show_calc_options] = useState(initial_show_calc_options)

    const calculation_results = perform_calculations(calculations, wcomponents_by_id, calculation_custom_units)
    const existing_calculation_name_ids = calculations.map(({ name }) => name)

    // Note: I do not think `editable_list_entry` makes semantic sense here. We're
    // only using it to get the CSS styles applied for `expansion_button`.
    return <div className={"editable_list_entry padded " + (show_form ? "expanded" : "")}>
        <div
            className="summary_header"
            style={{ cursor: "pointer" }}
            onClick={() => set_show_form(!show_form)}
        >
            <div className="summary">
                <h4 style={{ display: "inline-block" }}>
                    Calculations {(!show_form && calculations.length) ? `(${calculations.length})` : ""}
                </h4>
                {/* <div style={{ display: "inline-block", position: "relative", top: 7, left: 5 }}>
                    <WarningTriangleV2 warning={""} label="" />
                </div> */}
            </div>

            <div className="expansion_button"/>
        </div>


        {/* We could use <div className="details"> here but MUI is slow so want to minimise risk of it degrading performance, see #214 */}
        {show_form && <div>
            <Box display="flex" flexDirection="row" flexWrap="wrap" overflow="hidden">
                {calculations.map((calc, index) => <EditableCalculationRow
                    key={calc.id}
                    editing={props.editing}
                    show_options={show_calc_options[calc.id] || false}
                    set_show_options={show_options =>
                    {
                        const new_show_calc_options = {
                            ...show_calc_options,
                            [calc.id]: show_options,
                        }
                        set_show_calc_options(new_show_calc_options)
                    }}
                    calculation={calc}
                    calculation_result={calculation_results[index]}
                    existing_calculation_name_ids={existing_calculation_name_ids}
                    update_calculation={modified_calculation =>
                    {
                        const modified_calculations_with_nulls = [
                            ...calculations.slice(0, index),
                            modified_calculation,
                            ...calculations.slice(index + 1),
                        ]

                        const type_safe_modified_calculations = modified_calculations_with_nulls.filter(calc => !!calc) as PlainCalculationObject[]
                        const modified_calculations = type_safe_modified_calculations.length ? type_safe_modified_calculations : undefined

                        props.upsert_wcomponent({ calculations: modified_calculations })
                    }}
                    disallowed_commands={(() => {
                        const disallowed_commands = new Set<EditableCalculationRowCommands>()
                        if (index === 0) disallowed_commands.add("move_up")
                        if (index === (calculations.length - 1)) disallowed_commands.add("move_down")

                        return disallowed_commands
                    })()}
                    update_calculations={command =>
                    {
                        if (command === "move_up")
                        {
                            const other_index = index - 1
                            if (!index_is_in_bounds(calculations, other_index)) return

                            const modified_calculations = swap_elements(calculations, index, other_index)
                            props.upsert_wcomponent({ calculations: modified_calculations })
                        }
                        else if (command === "move_down")
                        {
                            const other_index = index + 1
                            if (!index_is_in_bounds(calculations, other_index)) return

                            const modified_calculations = swap_elements(calculations, index, other_index)
                            props.upsert_wcomponent({ calculations: modified_calculations })
                        }
                        else if (command === "add_above")
                        {
                            const new_calculation = prepare_new_calculation(calculations)
                            const modified_calculations = insert_element_at_index(calculations, new_calculation, index)
                            props.upsert_wcomponent({ calculations: modified_calculations })
                        }
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        else if (command === "add_below")
                        {
                            const new_calculation = prepare_new_calculation(calculations)
                            const modified_calculations = insert_element_at_index(calculations, new_calculation, index + 1)
                            props.upsert_wcomponent({ calculations: modified_calculations })
                        }
                    }}
                />)}
            </Box>

            {props.editing && <Button
                value="Add calculation"
                fullWidth={true}
                onClick={() =>
                {
                    const new_calculation = prepare_new_calculation(calculations)
                    const modified_calculations = [ ...calculations, new_calculation ]
                    props.upsert_wcomponent({ calculations: modified_calculations })
                }}
            />}
        </div>}
    </div>
}

export const WComponentCalculatonsForm = connector(_WComponentCalculatonsForm) as FunctionalComponent<OwnProps>



function prepare_new_calculation (calculations: PlainCalculationObject[])
{
    let next_id = -1
    calculations.forEach(calc => next_id = Math.max(next_id, calc.id))
    ++next_id

    const name = get_valid_calculation_name_id(calculations.map(({ name }) => name))
    const value = ""

    return { id: next_id, name, value }
}
