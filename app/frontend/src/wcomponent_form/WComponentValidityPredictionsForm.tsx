import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import {
    WComponent,
    WComponentCanHaveValidityPredictions,
    wcomponent_is_plain_connection,
} from "../wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { PredictionList } from "./values_and_predictions/to_deprecate/PredictionList"
import { useState } from "preact/hooks"



interface OwnProps
{
    wcomponent: WComponentCanHaveValidityPredictions
    upsert_wcomponent: (partial_wcomponent: Partial<WComponent>) => void
    force_editable?: boolean
}


const map_state = (state: RootState) =>
{
    return {
        consumption_formatting: state.display_options.consumption_formatting,
    }
}



const map_dispatch = {
    change_route: ACTIONS.routing.change_route
}



const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentValidityPredictionsForm (props: Props)
{
    const { wcomponent } = props
    const { validity: validity_predictions = [] } = wcomponent

    const [show_form, set_show_form] = useState(validity_predictions.length > 0)

    if (props.consumption_formatting && validity_predictions.length === 0) return null


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
                    Validity Predictions {(!show_form && validity_predictions.length) ? `(${validity_predictions.length})` : ""}
                </h4>
            </div>

            <div className="expansion_button"/>
        </div>

        {/* We could use <div className="details"> here but MUI is slow so want to minimise risks, see #214 */}
        {show_form && <PredictionList
            // TODO remove this hack and restore existence predictions
            item_descriptor={(wcomponent_is_plain_connection(wcomponent) ? "Existence " : "Validity ") + " prediction"}
            predictions={validity_predictions}
            update_predictions={new_predictions =>
            {
                const ms = new Date().getTime() + 1
                props.change_route({ args: { created_at_ms: ms, sim_ms: ms } })
                props.upsert_wcomponent({ validity: new_predictions })
            }}
        />}
    </div>
}

export const WComponentValidityPredictionsForm = connector(_WComponentValidityPredictionsForm) as FunctionalComponent<OwnProps>
