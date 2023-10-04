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
import { SIMULATION_JS_RESERVED_WORDS } from "../../calculations/reserved_words"
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
    const [show_calculations, set_show_calculations] = useState(false)

    const {
        wcomponent,
        wcomponents_by_id,
    } = props

    const { calculations = [] } = wcomponent

    const calculation_results = perform_calculations(calculations, wcomponents_by_id)
    const existing_calculation_name_ids = calculations.map(({ name }) => name)

    return <div className={"editable_list_entry " + (show_calculations ? "expanded" : "")}>
        <div
            className="summary_header"
            style={{ cursor: "pointer" }}
            onClick={() => set_show_calculations(!show_calculations)}
        >
            <div className="summary">
                <h4 style={{ display: "inline-block" }}>
                    Calculations {(!show_calculations && calculations.length) ? `(${calculations.length})` : ""}
                </h4>
                <div style={{ display: "inline-block", position: "relative", top: 7, left: 5 }}>
                    <WarningTriangleV2 warning={""} label="" />
                </div>
            </div>

            <div className="expansion_button"/>
        </div>


        {show_calculations && <div>
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
