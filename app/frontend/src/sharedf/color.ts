import type { Color } from "../shared/interfaces"



export function color_to_string (color: Color | undefined)
{
    if (!color) return "white"

    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
}



export function color_to_opposite (color: Color | undefined): Color
{
    if (!color) return { r: 0, g: 0, b: 0, a: 1 }

    const total = color.r + color.g + color.b
    const v = total < 383 ? 255 : 0

    return { r: v, g: v, b: v, a: 1 }
}
