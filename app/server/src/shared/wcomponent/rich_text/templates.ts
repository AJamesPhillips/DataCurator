

// \u2717 --> ✗
export const format_wcomponent_id_error = (error: string, str: string) => `\u2717@@${str} (${error})`


export const format_wcomponent_url = (root_url: string, id: string) => `${root_url}#wcomponents/${id}&view=knowledge`


// \uD83D\uDD17 --> 🔗 aka the very ugly link (chain) character
// \u25A1 --> □
export const format_wcomponent_link = (root_url: string, id: string, content: string = "\u25A1") => `[${content}](${format_wcomponent_url(root_url, id)})`
