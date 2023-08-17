

// \u2717 --> ✗
export const format_wcomponent_id_error = (text: string, error: string) => `\u2717${text} (${error})`


export const format_wcomponent_url = (root_url: string, id: string, knowledge_view_id = "") => `${root_url}#wcomponents/${id}` + (knowledge_view_id ? `&subview_id=${knowledge_view_id}` : "") //&view=knowledge`

// export const format_wcomponent_url = (root_url: string, id: string, position?: CanvasPoint) => `${root_url}#wcomponents/${id}&view=knowledge${format_position(position)}`

// function format_position (position?: CanvasPoint)
// {
//     if (!position) return ""
//     return `&x=${position.left}&y=${-position.top}&zoom=100`
// }


// \uD83D\uDD17 --> 🔗 aka the very ugly link (chain) character
// \u25A1 --> □
export const format_wcomponent_link = (root_url: string, id: string, content: string = "\u25A1", knowledge_view_id = "") => `[${content}](${format_wcomponent_url(root_url, id, knowledge_view_id)})`
