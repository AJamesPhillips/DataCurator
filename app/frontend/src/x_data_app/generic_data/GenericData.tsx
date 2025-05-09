import { useState } from "preact/hooks"

import type {
    WComponentMultidimensionalState,
    WComponentMultidimensionalStateData,
} from "../../wcomponent/interfaces/state"
import { MultidimensionalDataForm } from "../MultidimensionalDataForm"
import { load_local_data, save_local_data } from "../state/local_data"



export function GenericData ()
{
    const [_, refresh] = useState({})
    const {
        multidimensional_states,
        multidimensional_state_datas,
    } = load_local_data()

    const set_multidimensional_states = (multidimensional_states: WComponentMultidimensionalState[]) =>
    {
        save_local_data({ multidimensional_states })
        refresh({})
    }
    const set_multidimensional_state_datas = (multidimensional_state_datas: WComponentMultidimensionalStateData[]) =>
    {
        save_local_data({ multidimensional_state_datas })
        refresh({})
    }



    return <div>
        GenericData

        <MultidimensionalDataForm
            add_multidimensional_state={multidimensional_state =>
            {
                set_multidimensional_states([...multidimensional_states, multidimensional_state])
            }}
            add_multidimensional_state_data={multidimensional_state_data =>
            {
                set_multidimensional_state_datas([
                    ...multidimensional_state_datas,
                    multidimensional_state_data
                ])
            }}
        />

        <hr />

        {multidimensional_states.map(multidimensional_state => <div>
            {multidimensional_state.title}
        </div>)}
    </div>
}
