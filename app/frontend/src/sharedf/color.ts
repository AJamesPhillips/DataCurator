import type { Color } from "../shared/interfaces"



export function color_to_string (color: Color | undefined)
{
    if (!color) return undefined;

    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
}
