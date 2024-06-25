import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import {
    WComponent,
    wcomponent_allowed_calculations,
    wcomponent_has_calculations,
    wcomponent_is_state_value,
    WComponentIsAllowedToHaveStateVAPSets,
} from "../wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"
import { get_wcomponent_VAPs_represent } from "../wcomponent/get_wcomponent_VAPs_represent"
import { WComponentCalculatonsForm } from "./calculations/WComponentCalculatonsForm"
import { update_VAPSets_with_possibilities } from "../wcomponent/CRUD_helpers/update_VAPSets_with_possibilities"
import { VAPsType } from "../wcomponent/interfaces/VAPsType"
import { WComponentValuePossibilitiesForm } from "./value_possibilities/WComponentValuePossibilitiesForm"
import { WComponentValueAndPredictionsForm } from "./WComponentValueAndPredictionsForm"



interface OwnProps
{
    editing_allowed: boolean
    wcomponent: WComponentIsAllowedToHaveStateVAPSets
    upsert_wcomponent: (partial_wcomponent: Partial<WComponent>) => void
}


const map_state = (state: RootState) =>
{
    return {
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    }
}


const map_dispatch = {
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentStateForm (props: Props)
{
    const {
        editing_allowed, wcomponent, upsert_wcomponent,
        wcomponents_by_id,
    } = props

    const VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id)
    const orig_values_and_prediction_sets = wcomponent.values_and_prediction_sets
    const orig_value_possibilities = wcomponent.value_possibilities

    return <>
        {((editing_allowed && wcomponent_allowed_calculations(wcomponent))
        || (wcomponent_has_calculations(wcomponent) && wcomponent.calculations.length > 0)) &&
        <WComponentCalculatonsForm
            wcomponent={wcomponent}
            upsert_wcomponent={upsert_wcomponent}
        />}


        {(orig_values_and_prediction_sets !== undefined && (editing_allowed || orig_values_and_prediction_sets.length > 0)) &&
        <WComponentValueAndPredictionsForm
            editing_allowed={editing_allowed}
            wcomponent={wcomponent}
            upsert_wcomponent={upsert_wcomponent}
            VAPs_represent={VAPs_represent}
            orig_values_and_prediction_sets={orig_values_and_prediction_sets}
            orig_value_possibilities={orig_value_possibilities}
        />}


        {VAPs_represent !== VAPsType.undefined
            && orig_values_and_prediction_sets !== undefined
            && (editing_allowed || (Object.keys(orig_value_possibilities || {}).length > 0))
            && <WComponentValuePossibilitiesForm
                editing={editing_allowed}
                attribute_wcomponent={wcomponents_by_id[(wcomponent_is_state_value(wcomponent) && wcomponent.attribute_wcomponent_id) || ""]}
                VAPs_represent={VAPs_represent}
                value_possibilities={orig_value_possibilities}
                values_and_prediction_sets={orig_values_and_prediction_sets}
                update_value_possibilities={value_possibilities =>
                {
                    const values_and_prediction_sets = update_VAPSets_with_possibilities(orig_values_and_prediction_sets, value_possibilities)
                    upsert_wcomponent({ value_possibilities, values_and_prediction_sets })
                }}
            />
        }
    </>
}

export const WComponentStateForm = connector(_WComponentStateForm) as FunctionalComponent<OwnProps>
