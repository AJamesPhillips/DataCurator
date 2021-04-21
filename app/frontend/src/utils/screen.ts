


export function get_element_position (element: HTMLElement)
{
    let el: HTMLElement | null = element

    let top = 0
    let left = 0
    do {
        top += el.offsetTop  || 0
        left += el.offsetLeft || 0
        el = el.offsetParent as HTMLElement
    } while (el)

    return { top, left }
}
