import { pub_sub_factory } from "../pub_sub/pub_sub_factory"
import type { ActionKeyEventArgs } from "./actions"



interface GlobalKeysMsgMap
{
    key_down: ActionKeyEventArgs
    key_up: ActionKeyEventArgs
}

export const global_keys_pub_sub = pub_sub_factory<GlobalKeysMsgMap>()
