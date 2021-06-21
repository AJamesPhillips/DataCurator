


export interface GlobalKeysState
{
    last_key: string | undefined
    last_key_time_stamp: number | undefined
    keys_down: Set<string>
    derived: {
        shift_down: boolean
        control_down: boolean
        shift_or_control_down: boolean
    }
}



export function get_global_keys_starting_state (): GlobalKeysState
{
    return {
        last_key: undefined,
        last_key_time_stamp: undefined,
        keys_down: new Set(),
        derived: {
            shift_down: false,
            control_down: false,
            shift_or_control_down: false,
        }
    }
}
