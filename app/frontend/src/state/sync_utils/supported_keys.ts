import type { RootState } from "../State"



const root_state_keys: {[k in keyof RootState]: true} = {
    controls: true,
    creation_context: true,
    filter_context: true,
    statements: true,
    patterns: true,
    objects: true,
    specialised_objects: true,
    last_action: true,
    display_options: true,
    sync: true,
    routing: true,
    global_keys: true,
    objectives: true,
    meta_wcomponents: true,
    derived: true,
    user_activity: true,
}
export const supported_keys = Object.keys(root_state_keys) as (keyof RootState)[]
