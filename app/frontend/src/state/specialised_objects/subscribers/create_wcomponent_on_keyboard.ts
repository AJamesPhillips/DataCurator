import type { Store } from "redux"

import type { RootState } from "../../State"



export function create_wcomponent_on_keyboard (store: Store<RootState>)
{
    return () =>
    {
        const state = store.getState()
    }
}
