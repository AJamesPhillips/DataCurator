

export function to_vec (angle: number, r: number)
{
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    return { x, y }
}
