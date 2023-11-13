import { get_action_active_date_ranges } from "../priorities/utils/get_action_active_date_ranges"
import { is_defined } from "../shared/utils/is_defined"
import type { ComposedKnowledgeView } from "../state/derived/State"
import { get_wcomponent_from_state } from "../state/specialised_objects/accessors"
import { create_wcomponent } from "../state/specialised_objects/wcomponents/create_wcomponent_type"
import type { RootState } from "../state/State"
import {
    WComponent,
    WComponentsById,
    is_a_wcomponent,
    wcomponent_is_action,
    wcomponent_is_causal_link,
    wcomponent_is_plain_connection,
} from "../wcomponent/interfaces/SpecialisedObjects"



interface ConsoleApi
{
    get_current_visible_graph: () => KnowledgeGraphApi

    matrix_component_ids_to_labels: (component_id_to_label_names_map: ComponentIdToLabelNamesMapApiResult, matrix: ConnectionMatrixApiResult) => ConnectionMatrixApiResult
    matrix_component_ids_to_titles: (wcomponents_by_id: WComponentsById, matrix: ConnectionMatrixApiResult) => ConnectionMatrixApiResult
    matrix_to_csv: (matrix: ConnectionMatrixApiResult) => string
    get_current_kv: (error_on_missing_kv?: boolean) => ComposedKnowledgeView | undefined
    get_wcomponents_by_id: () => WComponentsById

    create_wcomponent: typeof create_wcomponent
    get_current_wcomponent: () => WComponent | undefined
    get_selected_wcomponents: () => WComponent[]
    get_action_wcomponent_elapsed_minutes: (wc: WComponent, as_text?: boolean) => number | string
    get_selected_wcomponents_elapsed_minutes: (as_text?: boolean) => number | string
}

interface KnowledgeGraphApi
{
    get_connection_map: (args?: { causal_only?: boolean }) => ConnectionMapApiResult
    get_connection_matrix: (args?: { causal_only?: boolean }) => ConnectionMatrixApiResult
    get_component_id_to_label_names_map: () => ComponentIdToLabelNamesMapApiResult
}


interface ConnectionMapApiResult
{
    node_ids_connections_map: NodeIdsConnectionsMap
    node_ids: Set<string>
}
interface NodeIdsConnectionsMap
{
    [from_wc_id: string]: { [to_wc_id: string]: number[] }
}

type Cell = number[] | string
type Row = Cell[]
type ConnectionMatrixApiResult = Row[]

interface ComponentIdToLabelNamesMapApiResult
{
    [component_id: string]: string[]
}



function get_current_kv (error_on_missing_kv: true): ComposedKnowledgeView
function get_current_kv (error_on_missing_kv: boolean | undefined): ComposedKnowledgeView | undefined
function get_current_kv (error_on_missing_kv: boolean = false): ComposedKnowledgeView | undefined
{
    const state = get_state()
    const current_kv = state.derived.current_composed_knowledge_view

    if (error_on_missing_kv && !current_kv) throw new Error(`Lacking current_composed_knowledge_view`)

    return current_kv
}


function get_wcomponents_by_id ()
{
    const state = get_state()
    return state.specialised_objects.wcomponents_by_id
}



function get_connection_map (args: { causal_only?: boolean } = {}): ConnectionMapApiResult
{
    const current_kv = get_current_kv(true)
    const wcomponents_by_id = get_wcomponents_by_id()

    const { causal_only = true } = args

    const visible_ids = new Set(Object.keys(current_kv.composed_visible_wc_id_map))
    const connection_ids = Array.from(causal_only ? current_kv.wc_ids_by_type.causal_link : current_kv.wc_ids_by_type.any_link)
    const visible_connection_ids = connection_ids.filter(id => visible_ids.has(id))


    const connections = visible_connection_ids.map(id => wcomponents_by_id[id])
        .filter(wcomponent_is_plain_connection)
        .filter(wc => wc.from_id && wc.to_id)
        .filter(wc => wcomponents_by_id[wc.from_id] && wcomponents_by_id[wc.to_id])


    const node_ids = new Set<string>()
    const node_ids_connections_map: NodeIdsConnectionsMap = {}
    connections.forEach(wc =>
    {
        node_ids.add(wc.from_id)
        node_ids.add(wc.to_id)

        const tos = node_ids_connections_map[wc.from_id] || {}
        node_ids_connections_map[wc.from_id] = tos

        const values = tos[wc.to_id] || []
        tos[wc.to_id] = values

        let value = 1
        if (wcomponent_is_causal_link(wc)) value = wc.effect_when_true ?? 1
        values.push(value)
    })

    return { node_ids_connections_map, node_ids }
}



function get_connection_matrix (args: { causal_only?: boolean } = {})
{
    const { node_ids_connections_map, node_ids } = get_connection_map(args)


    const matrix: Row[] = []

    const row_1: string[] = [""] // blank top left corner
    matrix.push(row_1)
    Array.from(node_ids).forEach(from_id => row_1.push(from_id))

    Array.from(node_ids).forEach(to_id =>
    {
        const new_row: Row = [to_id]
        Array.from(node_ids).forEach(from_id =>
        {
            const values = ((node_ids_connections_map[from_id] || {})[to_id]) || []

            new_row.push(values)
        })
        matrix.push(new_row)
    })


    return matrix
}



function get_component_id_to_label_ids_map (): {[component_id: string]: string[]}
{
    const current_kv = get_current_kv(true)
    const wcomponents_by_id = get_wcomponents_by_id()

    const visible_ids = Object.keys(current_kv.composed_visible_wc_id_map)
    const visible_components: WComponent[] = visible_ids.map(id => wcomponents_by_id[id])
        .filter(is_defined)

    const component_id_to_label_ids_map: {[component_id: string]: string[]} = {}
    visible_components.forEach(wc =>
    {
        if (!wc.label_ids || wc.label_ids.length === 0) return
        component_id_to_label_ids_map[wc.id] = wc.label_ids
    })

    return component_id_to_label_ids_map
}



function get_component_id_to_label_names_map (): ComponentIdToLabelNamesMapApiResult
{
    const wcomponents_by_id = get_wcomponents_by_id()
    const component_id_to_label_ids_map = get_component_id_to_label_ids_map()

    const label_id_to_title_map: {[label_id: string]: string} = {}

    const component_id_to_label_names_map: {[component_id: string]: string[]} = {}
    Object.entries(component_id_to_label_ids_map).forEach(([component_id, label_ids]) =>
    {
        const label_names = label_ids.map(label_id =>
        {
            const wcomponent_label = wcomponents_by_id[label_id]
            if (!wcomponent_label) return ""

            const label_name = label_id_to_title_map[label_id] || wcomponent_label.title
            label_id_to_title_map[label_id] = label_name

            return label_name
        })

        component_id_to_label_names_map[component_id] = label_names
    })

    return component_id_to_label_names_map
}



function convert_matrix_component_ids (matrix: ConnectionMatrixApiResult, converter: (component_id: string) => string): ConnectionMatrixApiResult
{
    const connection_matrix_using_label_names = matrix.map(row =>
    {
        return row.map(cell =>
        {
            if (typeof cell !== "string") return cell

            if (!cell) return ""

            return converter(cell)
        })
    })


    return connection_matrix_using_label_names
}



function matrix_component_ids_to_labels (component_id_to_label_names_map: ComponentIdToLabelNamesMapApiResult, matrix: ConnectionMatrixApiResult): ConnectionMatrixApiResult
{
    const component_id_to_compound_label_name: {[component_id: string]: string} = {}
    const compound_compound_label_name_count: {[compound_label_name: string]: number} = {}


    const connection_matrix_using_label_names = convert_matrix_component_ids(matrix, cell =>
    {
        let compound_label_name = component_id_to_compound_label_name[cell] || ""
        if (!compound_label_name)
        {
            const label_names = component_id_to_label_names_map[cell] || []
            compound_label_name = label_names.join(",")

            const count = (compound_compound_label_name_count[compound_label_name] || 0) + 1
            compound_compound_label_name_count[compound_label_name] = count

            compound_label_name += `_${count}`
            component_id_to_compound_label_name[cell] = compound_label_name
        }

        return compound_label_name
    })


    return connection_matrix_using_label_names
}



function matrix_component_ids_to_titles (wcomponents_by_id: WComponentsById, matrix: ConnectionMatrixApiResult): ConnectionMatrixApiResult
{
    const connection_matrix_using_component_titles = convert_matrix_component_ids(matrix, cell =>
    {
        return wcomponents_by_id[cell]?.title || ""
    })

    return connection_matrix_using_component_titles
}



function matrix_to_csv (matrix: ConnectionMatrixApiResult)
{
    const csv: string[] = []

    matrix.forEach(row =>
    {
        const row_csv: string[] = []
        row.forEach(cell =>
        {
            if (typeof cell === "string") row_csv.push(cell)
            else
            {
                if (cell.length === 0) row_csv.push("")
                else if (cell.length === 1) row_csv.push((cell[0] || 0).toString())
                else row_csv.push(JSON.stringify(cell))
            }
        })

        csv.push(row_csv.join(",") + "\n")
    })

    return csv.join("")
}



function get_current_visible_graph (): KnowledgeGraphApi
{
    return {
        get_connection_map,
        get_connection_matrix,
        get_component_id_to_label_names_map,
    }
}



function get_current_wcomponent ()
{
    const state = get_state()
    const current_wc_id = state.routing.item_id || ""
    const current_wc = state.specialised_objects.wcomponents_by_id[current_wc_id]

    return current_wc
}



function get_selected_wcomponents ()
{
    const state = get_state()
    return state.meta_wcomponents.selected_wcomponent_ids_list
        .map(id => get_wcomponent_from_state(state, id))
        .filter(is_a_wcomponent)
}



function get_action_wcomponent_elapsed_minutes (wcomponent: WComponent, as_text: true): string
function get_action_wcomponent_elapsed_minutes (wcomponent: WComponent, as_text: boolean | undefined): number
function get_action_wcomponent_elapsed_minutes (wcomponent: WComponent, as_text?: boolean): number | string
{
    let elapsed_time = 0
    if (wcomponent_is_action(wcomponent))
    {
        const transitions = get_action_active_date_ranges(wcomponent)
        transitions.forEach(({ start, stop }) => elapsed_time += (stop.getTime() - start.getTime()))
    }

    elapsed_time = Math.round(elapsed_time / 1000) // get value in seconds

    return as_text ? seconds_to_string(elapsed_time) : round_seconds_to_minutes(elapsed_time)
}


function round_seconds_to_minutes (elapsed_time: number)
{
    return Number.parseFloat((elapsed_time / 60).toFixed(2))  // return value in minutes
}


function seconds_to_string (elapsed_time: number)
{
    const seconds = elapsed_time % 60
    elapsed_time = Math.round((elapsed_time - seconds) / 60)  // get in minutes, math.round in case of any weirdness
    const minutes = elapsed_time % 60
    elapsed_time = Math.round((elapsed_time - minutes) / 60)  // get in hours, math.round in case of any weirdness
    const hours = elapsed_time % 24
    elapsed_time = Math.round((elapsed_time - hours) / 24)  // get in days, math.round in case of any weirdness

    let elapsed_time_str = ""
    if (elapsed_time) elapsed_time_str += `${elapsed_time} days`
    if (elapsed_time || hours) elapsed_time_str += ` ${hours} hours`
    if (elapsed_time || hours || minutes) elapsed_time_str += ` ${minutes} minutes`
    elapsed_time_str += ` ${seconds} seconds`
    elapsed_time_str = elapsed_time_str.trim()

    return elapsed_time_str
}



function get_selected_wcomponents_elapsed_minutes (as_text?: boolean): number | string
{
    const elapsed_minutes = get_selected_wcomponents().map(w => get_action_wcomponent_elapsed_minutes(w, false)).reduce((i, t) => i + t)
    const elapsed_seconds = elapsed_minutes * 60

    return as_text ? seconds_to_string(elapsed_seconds) : round_seconds_to_minutes(elapsed_seconds)
}



export function setup_console_api ()
{
    const console_api: ConsoleApi = {
        get_current_visible_graph,

        matrix_component_ids_to_labels,
        matrix_component_ids_to_titles,
        matrix_to_csv,
        get_current_kv,
        get_wcomponents_by_id,

        create_wcomponent,
        get_current_wcomponent,
        get_selected_wcomponents,
        get_action_wcomponent_elapsed_minutes,
        get_selected_wcomponents_elapsed_minutes,
    }

    ;(window as any).console_api = console_api
}



function get_state (): RootState
{
    return (window as any).debug_state
}
