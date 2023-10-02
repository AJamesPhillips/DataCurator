


const links_regex = /(.*?)(?:\[([^\]]*)\]\([^\)]*\))/g
const tags_regex = /(.*?)(\<[^\>]*\>)/g


export function remove_rich_text (text: string): string
{
    text = text.replaceAll(links_regex, "$1$2")
    text = text.replaceAll(tags_regex, "$1")

    return text
}
