import { SCALE_BY } from "./zoom_utils"



export function client_to_canvas (zoom: number, client_xy: number)
{
    return client_xy * (SCALE_BY / zoom)
}

export function client_to_canvas_x (x: number, zoom: number, client_x: number)
{
    return x + client_to_canvas(zoom, client_x)
}

export function client_to_canvas_y (y: number, zoom: number, client_y: number)
{
    return y - client_to_canvas(zoom, client_y)
}
