import { pub_sub_factory } from "../pub_sub/pub_sub_factory"



export interface ToastMessage
{
    text: string
    duration?: number // in ms, default 3000
    type?: "info" | "success" | "error" | "warning" // default "info"
    id?: string // optional, used to identify the toast message
}


export interface FullToastMessage
{
    text: string
    duration: number
    type: "info" | "success" | "error" | "warning"
    id: string // unique identifier for the toast message
}


interface ToastMsgMap
{
    send_toast_message: ToastMessage
    accepted_toast_message: FullToastMessage
}


let message_id = 0
export const toast_pub_sub = pub_sub_factory<ToastMsgMap>({
    send_toast_message: (message: ToastMessage) =>
    {
        const publish_message: FullToastMessage = {
            ...message,
            duration: message.duration ?? 3000,
            type: message.type ?? "info",
            id: message.id ?? `${message_id++}`
        }

        setTimeout(() => toast_pub_sub.pub("accepted_toast_message", publish_message), 0)

        return {
            continue: false,
            message,
        }
    }
})
