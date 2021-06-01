import { test } from "../shared/utils/test"
import type { BoundingRect } from "../state/display_options/state"
import { bounded } from "../shared/utils/bounded"



export const bound_zoom = (new_zoom: number) => bounded(new_zoom, 10, 400)

export const scale_by = 100


interface CalculateNewZoomArgs
{
    zoom: number
    wheel_change: number
}
const zoom_sensitivity = 0.01
export function calculate_new_zoom (args: CalculateNewZoomArgs)
{
    const { zoom, wheel_change } = args

    const raw_zoom = zoom - (wheel_change * zoom_sensitivity * zoom)
    const new_zoom = bound_zoom(Math.round(raw_zoom))

    return new_zoom
}


interface CalculateNewZoomXYArgs
{
    old: { zoom: number, x: number, y: number }
    new_zoom: number
    bounding_rect: BoundingRect
    pointer_x: number
    pointer_y: number
}
export function calculate_new_zoom_xy (args: CalculateNewZoomXYArgs)
{
    const { old, new_zoom, bounding_rect, pointer_x, pointer_y } = args

    const client_x = pointer_x - bounding_rect.left
    const client_y = pointer_y - bounding_rect.top

    const client_width = bounding_rect.width
    const client_height = bounding_rect.height

    const x_factor = client_x / client_width
    const y_factor = client_y / client_height

    const scale = (scale_by / new_zoom) - (scale_by / old.zoom)

    const dx = x_factor * client_width * scale
    const dy = y_factor * client_height * scale

    const new_x = old.x - dx
    const new_y = old.y + dy

    return { x: new_x, y: new_y }
}



function run_tests ()
{
    console. log("running tests of calculate_new_zoom_xy etc")

    let result: { x: number, y: number }
    const width = 900
    const height = 600
    const canvas_left = 5
    const canvas_top = 15
    let zoom: number
    let new_zoom: number
    let pointer: "top_left" | "bottom_right"
    const bounding_rect = { width, height, left: canvas_left, top: canvas_top }
    const top_left = { pointer_x: canvas_left + 0, pointer_y: canvas_top + 0 }
    const bottom_right = { pointer_x: canvas_left + width, pointer_y: canvas_top + height }

    function calc (args: { x: number, y: number, zoom: number, new_zoom: number, pointer: "top_left" | "bottom_right" })
    {
        const pointer = args.pointer === "top_left"
            ? top_left : bottom_right

        return calculate_new_zoom_xy({
            old: { x: args.x, y: args.y, zoom: args.zoom },
            new_zoom: args.new_zoom,
            bounding_rect,
            ...pointer
        })
    }

    // zooming in/out top left should not change x and y
    pointer = "top_left"
    result = calc({ x: 0, y: 0, zoom: 10, new_zoom: 200, pointer })
    test(result, { x: 0, y: 0 })

    result = calc({ x: 100, y: 100, zoom: 200, new_zoom: 200, pointer })
    test(result, { x: 100, y: 100 })

    result = calc({ x: 100, y: 100, zoom: 200, new_zoom: 10, pointer })
    test(result, { x: 100, y: 100 })

    // zoom with pointer in bottom right
    pointer = "bottom_right"
    // zoom out
    zoom = 100
    new_zoom = 50
    result = calc({ x: 0, y: 0, zoom, new_zoom, pointer })
    test(result, { x: -width, y: height })

    result = calc({ x: 100, y: 100, zoom, new_zoom, pointer })
    test(result, { x: -width + 100, y: height + 100 })

    zoom = 200
    new_zoom = 100
    result = calc({ x: 0, y: 0, zoom, new_zoom, pointer })
    test(result, { x: -width / 2, y: height / 2 })

    result = calc({ x: 100, y: 100, zoom, new_zoom, pointer })
    test(result, { x: (-width / 2) + 100, y: (height / 2) + 100 })

    // zoom in
    zoom = 100
    new_zoom = 200
    result = calc({ x: 0, y: 0, zoom, new_zoom, pointer })
    test(result, { x: width / 2, y: -height / 2 })

    result = calc({ x: 100, y: 100, zoom, new_zoom, pointer })
    test(result, { x: (width / 2) + 100, y: (-height / 2) + 100 })

    zoom = 50
    new_zoom = 100
    result = calc({ x: 0, y: 0, zoom, new_zoom, pointer })
    test(result, { x: width, y: -height })

    result = calc({ x: 100, y: 100, zoom, new_zoom, pointer })
    test(result, { x: width + 100, y: -height + 100 })

    // no zoom
    zoom = 50
    new_zoom = 50
    result = calc({ x: 0, y: 0, zoom, new_zoom, pointer })
    test(result, { x: 0, y: 0 })

    result = calc({ x: 100, y: 100, zoom, new_zoom, pointer })
    test(result, { x: 100, y: 100 })
}

// run_tests()
