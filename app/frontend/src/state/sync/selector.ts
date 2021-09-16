import type { RootState } from "../State"



export function selector_is_using_solid_for_storage (state: Partial<RootState>)
{
    return state.sync && state.sync.use_solid_storage
}
