import type {
    WComponentMultidimensionalState,
    WComponentMultidimensionalStateData,
} from "../../wcomponent/interfaces/state"



export interface DataAppRootState
{
    multidimensional_states: WComponentMultidimensionalState[]
    multidimensional_state_datas: WComponentMultidimensionalStateData[]
}
