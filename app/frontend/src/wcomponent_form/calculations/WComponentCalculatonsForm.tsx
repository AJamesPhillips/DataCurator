import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { Box } from "@mui/material"

import type { WComponentNodeStateV2 } from "../../wcomponent/interfaces/state"
import type { RootState } from "../../state/State"
import { perform_calculations } from "../../calculations/perform_calculations"
import { EditableCalculationRow } from "./EditableCalculationRow"
import { WarningTriangleV2 } from "../../sharedf/WarningTriangleV2"
import { useState } from "preact/hooks"
import { Button } from "../../sharedf/Button"
import { PlainCalculationObject } from "../../calculations/interfaces"
import { get_valid_calculation_name_id } from "./get_valid_calculation_name_id"



interface OwnProps
{
    wcomponent: WComponentNodeStateV2
    upsert_wcomponent: (partial_wcomponent: Partial<WComponentNodeStateV2>) => void
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

    const { calculations = [] } = wcomponent
    const [show_form, set_show_form] = useState(calculations.length > 0)

    const calculation_results = perform_calculations(calculations, wcomponents_by_id)
    const existing_calculation_name_ids = calculations.map(({ name }) => name)

    // Note: I do not think `editable_list_entry` makes semantic sense here. We're
    // only using it to get the CSS styles applied for `expansion_button`.
    return <div className={"editable_list_entry " + (show_form ? "expanded" : "")}>
        <div
            className="summary_header"
            style={{ cursor: "pointer" }}
            onClick={() => set_show_form(!show_form)}
        >
            <div className="summary">
                <h4 style={{ display: "inline-block" }}>
                    Calculations {(!show_form && calculations.length) ? `(${calculations.length})` : ""}
                </h4>
                <div style={{ display: "inline-block", position: "relative", top: 7, left: 5 }}>
                    <WarningTriangleV2 warning={""} label="" />
                </div>
            </div>

            <div className="expansion_button"/>
        </div>


        {/* We could use <div className="details"> here but MUI is slow so want to minimise risks, see #214 */}
        {show_form && <div>
            <Box display="flex" flexDirection="row" flexWrap="wrap" overflow="hidden">
                {calculations.map((calc, index) => <EditableCalculationRow
                    editing={props.editing}
                    calculation={calc}
                    index={index}
                    calculation_results={calculation_results}
                    existing_calculation_name_ids={existing_calculation_name_ids}
                    update_calculation={new_calculation =>
                    {
                        const modified_calculations_with_nulls = [
                            ...calculations.slice(0, index),
                            new_calculation,
                            ...calculations.slice(index + 1),
                        ]

                        const type_safe_modified_calculations = modified_calculations_with_nulls.filter(calc => !!calc) as PlainCalculationObject[]
                        const modified_calculations = type_safe_modified_calculations.length ? type_safe_modified_calculations : undefined

                        props.upsert_wcomponent({ calculations: modified_calculations })
                    }}
                />)}
            </Box>

            {props.editing && <Button
                value="Add calculation"
                fullWidth={true}
                onClick={() =>
                {
                    const new_calculation = prepare_new_calculation(existing_calculation_name_ids)
                    const modified_calculations = [ ...calculations, new_calculation ]
                    props.upsert_wcomponent({ calculations: modified_calculations })
                }}
            />}
        </div>}
    </div>
}

export const WComponentCalculatonsForm = connector(_WComponentCalculatonsForm) as FunctionalComponent<OwnProps>



function prepare_new_calculation (existing_calculation_name_ids: string[])
{
    const name = get_valid_calculation_name_id(existing_calculation_name_ids)
    const value = ""

    return { name, value }
}
