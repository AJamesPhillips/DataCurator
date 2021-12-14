import { APP_DETAILS } from "../shared/constants"



const title_el = document.getElementsByTagName("title")[0]



export function set_window_title (title?: string)
{
    if (!title_el) return

    title_el.innerHTML = title || APP_DETAILS.NAME
}
