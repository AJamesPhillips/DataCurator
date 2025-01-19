import type { h } from "preact"

import type { KnowledgeViewWComponentEntry } from "../../shared/interfaces/knowledge_view"
import {
    wcomponent_type_is_plain_connection,
    type ConnectionTerminalAttributeType,
    type ConnectionTerminalType,
} from "../../wcomponent/interfaces/SpecialisedObjects"
import type { CanvasPoint } from "../interfaces"
import { NODE_WIDTH } from "../position_utils"
import { WComponentType } from "../../wcomponent/interfaces/wcomponent_base"



export interface Terminal
{
    type: ConnectionTerminalType
    style: h.JSX.CSSProperties
    label: string
}



const connection_diameter = 12
export const connection_radius = connection_diameter / 2
const connection_left = -6
const connection_top = 27
let connection_top_increment = 22
try { // defensive
    if (navigator.platform.indexOf("Win") > -1) connection_top_increment = 17 // see issue #171
} catch (e) {}


const attribute_type_to_ordinal: { [k in ConnectionTerminalAttributeType]: number } = {
    meta: 0,
    validity: 1,
    state: 2,
}

export function get_top_left_for_terminal_type (type: ConnectionTerminalType, node_scale: number = 1)
{
    const ordinal = attribute_type_to_ordinal[type.attribute]

    // TODO: describe what happens if this `top_offset_node_scale_fudge` is
    // removed to give some idea of what it is doing.
    const top_offset_node_scale_fudge = node_scale ** 1.14
    const top_offset = (connection_top + (ordinal * connection_top_increment)) * top_offset_node_scale_fudge

    const left_offset = connection_left + ((type.direction === "from" ? NODE_WIDTH : 0) * node_scale)

    return { left: left_offset, top: top_offset }
}


export interface ConnectionTerminus
{
    kv_wc_entry: KnowledgeViewWComponentEntry
    wcomponent_type: WComponentType
    connection_terminal_type: ConnectionTerminalType
}

export function get_connection_point (connection_terminal: ConnectionTerminus): CanvasPoint
{
    const {
        kv_wc_entry,
        wcomponent_type,
        connection_terminal_type,
    } = connection_terminal

    const terminus_is_connection = wcomponent_type_is_plain_connection(wcomponent_type)
    if (terminus_is_connection) return kv_wc_entry

    const node_scale = kv_wc_entry.s || 1
    let { left, top } = get_top_left_for_terminal_type(connection_terminal_type, node_scale)

    left += kv_wc_entry.left + connection_radius
    top += kv_wc_entry.top + connection_radius

    return { left, top }
}
