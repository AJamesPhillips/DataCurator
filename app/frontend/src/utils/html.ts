


export function find_parent_element_by_class (el: HTMLElement | null, class_name: string)
{
    while (el)
    {
        const { classList } = el
        if (classList && classList.contains(class_name)) break

        el = el.parentElement
    }

    return el
}



export function find_parent_element_by_classes (el: HTMLElement | null, class_names: string[])
{
    while (el)
    {
        const { classList } = el
        if (classList && class_names.find(class_name => classList.contains(class_name))) break

        el = el.parentElement
    }

    return el
}
