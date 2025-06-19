import { h } from "preact"
import { useEffect, useState } from "preact/hooks"

import { pub_sub } from "../state/pub_sub/pub_sub"
import { get_store } from "../state/store"
import { FullToastMessage } from "../state/toast/pub_sub"
import "./Toast.scss"



export const Toast = () =>
{
    const [messages, set_messages] = useState<FullToastMessage[]>([])


    useEffect(() =>
    {
        const unsubscribe_store = factory_handle_store_change()

        const unsubscribe_pub_sub = pub_sub.toast.sub("accepted_toast_message", message =>
        {
            set_messages(current_messages => [...current_messages, message])

            setTimeout(() =>
            {
                set_messages(current_messages => current_messages.filter(m => m !== message))
            }, message.duration)
        })

        return () =>
        {
            unsubscribe_store()
            unsubscribe_pub_sub()
        }
    }, [])


    return <div class="toast-container">
        {messages.map(message =>
            {
                const style: h.JSX.CSSProperties = {
                    animationDelay: `0s, ${message.duration - 500}ms`,
                }

                return <div
                    key={message.id}
                    class={`toast toast-${message.type}`}
                    style={style}
                    ref={el =>
                    {
                        if (!el) return
                        el.style.setProperty("--toast-height", `${el.offsetHeight}px`)
                    }}
                >
                    {message.text}
                </div>
            }
        )}
    </div>
}


function factory_handle_store_change ()
{
    const store = get_store()

    let last_warn_can_not_edit_ms: number | undefined = undefined
    const DURATION_FOR_WARN_CAN_NOT_EDIT = 5000

    function handle_store_change()
    {
        const state = store.getState()
        if (state.toast_message.warn_can_not_edit_ms)
        {
            const elapsed_ms = last_warn_can_not_edit_ms
                ? state.toast_message.warn_can_not_edit_ms - last_warn_can_not_edit_ms
                : Number.MAX_SAFE_INTEGER

            if (elapsed_ms > DURATION_FOR_WARN_CAN_NOT_EDIT)
            {
                last_warn_can_not_edit_ms = state.toast_message.warn_can_not_edit_ms
                pub_sub.toast.pub("send_toast_message", {
                    type: "info",
                    text: "You can view this project (but not edit it).",
                    duration: DURATION_FOR_WARN_CAN_NOT_EDIT,
                })
            }
        }
    }

    return store.subscribe(handle_store_change)
}
