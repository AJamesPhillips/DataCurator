import type { CanvasPoint } from "../../../canvas/interfaces"


// \u2717 --> ✗
export const format_wcomponent_id_error = (error: string, str: string) => `\u2717@@${str} (${error})`


export const format_wcomponent_url = (root_url: string, id: string, position?: CanvasPoint) => `${root_url}#wcomponents/${id}&view=knowledge${format_position(position)}`


function format_position (position?: CanvasPoint)
{
    if (!position) return ""
    return `&x=${position.left}&y=${-position.top}&zoom=100`
}


// \uD83D\uDD17 --> 🔗 aka the very ugly link (chain) character
// \u25A1 --> □
export const format_wcomponent_link = (root_url: string, id: string, content: string = "\u25A1") => `[${content}](${format_wcomponent_url(root_url, id)})`
