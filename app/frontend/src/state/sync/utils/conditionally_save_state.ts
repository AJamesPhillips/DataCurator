import type { StoreType } from "../../store"
import { needs_save } from "./needs_save"
import { save_state } from "./save_state"



export async function conditionally_save_state (store: StoreType)
{
    const should_save = calc_should_save(store, true)
    if (!should_save) return Promise.resolve()

    await save_state(store)
}



function calc_should_save (store: StoreType, cautious_save: boolean): boolean
{
    if (!store.load_state_from_storage) return false

    const state = store.getState()
    const { ready_for_writing, specialised_objects } = state.sync
    if (!ready_for_writing) return false

    // Although the app is ready to save do not try to if it failed before
    if (cautious_save && specialised_objects.status === "FAILED") return false

    if (cautious_save && !needs_save(state)) return false

    return true
}
