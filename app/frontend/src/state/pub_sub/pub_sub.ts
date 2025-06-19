import { canvas_pub_sub } from "../canvas/pub_sub"
import { global_keys_pub_sub } from "../global_keys/pub_sub"
import { toast_pub_sub } from "../toast/pub_sub"
import { user_pub_sub } from "../user_info/pub_sub"



export const pub_sub = {
    canvas: canvas_pub_sub,
    global_keys: global_keys_pub_sub,
    user: user_pub_sub,
    toast: toast_pub_sub,
}
