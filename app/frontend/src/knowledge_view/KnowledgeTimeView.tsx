import { Box } from "@mui/material"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { TimeResolution } from "datacurator-core/interfaces/datetime"

import { MainArea } from "../layout/MainArea"
import { sort_list, SortDirection } from "../shared/utils/sort"
import { get_created_at_ms, get_sim_datetime } from "../shared/utils_datetime/utils_datetime"
import type { RootState } from "../state/State"
import { WComponent, wcomponent_has_VAP_sets, wcomponent_is_plain_connection, WComponentConnection } from "../wcomponent/interfaces/SpecialisedObjects"
import { ConnectedValueAndPredictionSetSummary } from "../wcomponent_canvas/node/ConnectedValueAndPredictionSetSummary"
import { WComponentCanvasNode } from "../wcomponent_canvas/node/WComponentCanvasNode"
import "./KnowledgeTimeView.scss"



const map_state = (state: RootState) =>
{
    const { ready_for_reading: ready } = state.sync

    const { current_composed_knowledge_view: current_composed_knowledge_view } = state.derived

    if (ready && !current_composed_knowledge_view) console .log("No current_composed_knowledge_view")

    const { selected_wcomponent_ids_to_ordinal_position_map } = state.meta_wcomponents
    const { created_at_ms, sim_ms } = state.routing.args


    const wcomponent_nodes: WComponent[] = []
    const wcomponent_connections: WComponentConnection[] = []

    if (current_composed_knowledge_view)
    {
        current_composed_knowledge_view.wc_ids_by_type.any_node.forEach((wc_id: string) =>
        {
            const wcomponent = state.specialised_objects.wcomponents_by_id[wc_id]
            if (wcomponent) wcomponent_nodes.push(wcomponent)
        })

        current_composed_knowledge_view.wc_ids_by_type.any_link.forEach((wc_id: string) =>
        {
            const wcomponent = state.specialised_objects.wcomponents_by_id[wc_id]
            if (wcomponent_is_plain_connection(wcomponent)) wcomponent_connections.push(wcomponent)
        })
    }

    return {
        ready,
        wcomponent_nodes,
        wcomponent_connections,
        presenting: state.display_options.consumption_formatting,
        selected_wcomponent_ids_to_ordinal_position_map,
        created_at_ms,
        sim_ms,
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>

class DateRange {
    _ms(ms: number, convert: boolean=true): any {
        const operator = (convert)
            ? (arg1: number, arg2: number) => arg1 / arg2
            : (arg1: number, arg2: number) => arg1 * arg2

        return {
            milliseconds: ms,
            get seconds() { return operator(ms, 1000) },
            get minutes() { return operator(this.seconds, 60) },
            get hours() { return operator(this.minutes, 60) },
            get days() { return operator(this.hours, 24) },
            get months() { return operator(this.days, 365 / 12) },
            get years() { return operator(this.days, 365) },
            // get weeks() { return eval(`${this.days} ${operator} 7`) },
        }
    }
    scale = "months"
    single_time_units = this._ms(1, false)
    scales = Object.keys(this.single_time_units)
    get scale_index(): number { return this.scales.indexOf(this.scale) }

    dates: Date[] = []

    increment(date: Date, count: number = 1, scale: string = this.scale): Date {
        const new_date = new Date(date.getTime())
        const fn = this.get_date_prop_func_names(scale)
        Object(new_date)[fn.set](Object(new_date)[fn.get]() + count)
        return new_date
    }

    get range_dates(): Date[] {
        const dates: Date[] = []
        const end_date = this.round_date(this.increment(this.end_date, 1), true, this.scale)
        const current_date: Date = this.round_date(this.increment(this.start_date, -1), false, this.scale)
        dates.push(current_date)
        dates.push(end_date)
        return dates
    }

    get start_date(): Date {
        const d = this.dates.first()
        return ensure_date(d)
    }
    get end_date(): Date {
        const d = this.dates.last()
        return ensure_date(d)
    }

    get range_start_date(): Date {
        const d = this.range_dates.first()
        return ensure_date(d)
    }

    get range_end_date(): Date {
        const d = this.range_dates.last()
        return ensure_date(d)
    }

    get_date_offset_percent(date: Date): number {
        let percent: number = 0
        const date_ms: number = date.getTime()
        const start_ms: number = this.range_start_date.getTime()
        const end_ms: number = this.range_end_date.getTime()
        percent = ((date_ms - start_ms) / (end_ms - start_ms)) * 100
        return percent
    }

    get_date_prop_func_names(date_unit: string): Record<string, any> {
        let getter, setter: string|null = null
        const prop_name = date_unit.charAt(0).toUpperCase() + date_unit.slice(1)
        const date = new Date()
        const default_getter_name = `get${prop_name}`
        switch(date_unit) {
            case "days":
                getter = "getDate"
                break
            default:
                if (Object(date)[default_getter_name]) {
                    getter = default_getter_name
                } else if (Object(date)[default_getter_name.replace(/s$/, "")]) {
                    getter = default_getter_name.replace(/s$/, "")
                }
        }
        if (getter) {
            setter = getter.replace(/^get/, "set")
        }
        return {
            get: getter,
            set: setter
        }
    }

    round_date(date: Date, round_up: boolean = false, scale: string=this.scale): Date {
        const rounded_date = new Date(date.getTime())
        this.scales.forEach((scale, i) => {
            const date_prop_fns = this.get_date_prop_func_names(scale)
            const adjusted_value = (scale === "days") ? 1 : 0
            if (round_up) {
                if (i === this.scale_index) {
                    Object(rounded_date)[date_prop_fns.set](Object(rounded_date)[date_prop_fns.get]() + 1)
                } else if (i < this.scale_index) {
                    Object(rounded_date)[date_prop_fns.set](adjusted_value)
                }
            } else {
                if (i < this.scale_index) {
                    if (date_prop_fns.set && Object(rounded_date)[date_prop_fns.set]) {
                        Object(rounded_date)[date_prop_fns.set](adjusted_value)
                    }
                }
            }
        })
        if (round_up) {
            rounded_date.setTime(rounded_date.getTime() - 1)
        }
        return rounded_date
    }

    cdate: Date = new Date()
    sdate: Date = new Date()
    time_resolution: TimeResolution = "hour"
    timeline_spacing: boolean = true

    constructor(dates: Date[], props: Props) {
        if (dates.length === 0) return
        this.time_resolution = "day"
        this.scale = this.time_resolution + "s"
        this.cdate = new Date(props.created_at_ms)
        this.sdate = new Date(props.sim_ms)
        this.dates = dates.sort((a: Date, b: Date) => a.getTime() - b.getTime())
    }

    render (wcomponent_nodes: WComponent[]) {

        if (wcomponent_nodes.length === 0) return null

        const current_date = new Date(this.range_start_date.getTime())
        const all_range_dates: Date[] = []
        all_range_dates.push(new Date(current_date.getTime()))
        while (current_date.getTime() <= this.range_end_date.getTime()) {
            let fns = this.get_date_prop_func_names(this.scale)
            let current_value = Object(current_date)[fns.get]()
            Object(current_date)[fns.set](current_value + 1)
            all_range_dates.push(new Date(current_date.getTime()))
        }
        const max_width = (this.timeline_spacing) ? `${100 + (all_range_dates.length * 1.42)}%` : "100%"

        return (
            <Box
                id="knowledge_time_view"
                className={`time_view scroll_area_x ${this.scale} ${(this.timeline_spacing) ? "timeline_spacing" : "event_spacing" }`}
                flexGrow={1} flexShrink={1}
                position="relative"
                onScroll={(e: Event) => {
                    let scrolled_element: any = e.target
                    let scrolled_offset = scrolled_element.scrollLeft
                    let nodes: HTMLCollection = document.getElementsByClassName("wc")
                    for (let i = 0; i < nodes.length; i++) {
                        const node: any = nodes[i]
                        if (node) {
                            node.style.marginLeft = `${scrolled_offset}px`
                        }
                    }
                }}
            >
                <Box className={`timeline`}
                    display={(this.timeline_spacing) ? "block" : "none" }
                    height={1} maxHeight={1}
                    position="absolute"
                    minWidth={max_width} width={max_width} maxWidth={max_width}
                    top={0} right="auto" bottom={0} left={0}
                    zIndex={1}
                >
                    <Box
                        width={1} maxWidth={1}
                        height={1} maxHeight={1}
                        display="flex" flexDirection="row" flexWrap="wrap"
                    >
                        {all_range_dates.map((d, i) => {
                            return (
                                <Box className="unit"
                                    flexGrow={1} flexShrink={1} flexBasis="auto"
                                    position="relative" overflow="visible"
                                >
                                    <Box position="absolute" className="tick" width={0} height={1} top={0} right={0} bottom={0} left={0}>
                                        <Box className="rotater" whiteSpace="nowrap">
                                            <Box component="small" className="days weeks months years">{d.toLocaleDateString()}</Box>
                                            <Box component="small" className="hours">{d.toLocaleTimeString()}</Box>
                                        </Box>
                                    </Box>
                                </Box>
                            )
                        })}
                    </Box>
                </Box>
                <Box
                    minWidth={max_width} width={max_width} maxWidth={max_width}
                    minHeight={1} height={1} maxHeight={1}
                    overflow="hidden"
                >
                    <Box
                        className="scroll_area_y"
                        minWidth="100%" maxWidth="100%"
                        position="relative" zIndex={10}
                        height={1} maxHeight={1}
                    >
                        <Box className="contents" mt={(this.timeline_spacing) ? 50 : 0}>
                        {wcomponent_nodes.map(wc => {
                            const VAP_sets = wcomponent_has_VAP_sets(wc) ? wc.values_and_prediction_sets : []
                            // const wc_percent =  (wc.created_at) ? this.get_date_offset_percent(wc.created_at) : 0

                            return (
                                <Box
                                    width={1} maxWidth={1}
                                    overflow="hidden"
                                    position="relative"
                                >
                                    <Box id={`WC-${wc.id}`}
                                        className="wc"
                                        display="inline-block"
                                        position="relative"
                                        top={0}
                                    >
                                        {/* <Box component="small">{wc.created_at.toLocaleString()}</Box><br /> */}
                                        <WComponentCanvasNode id={wc.id} is_on_canvas={false} />
                                    </Box>

                                    <Box className="vaps"
                                        width={1} maxWidth={1} overflow="hidden"
                                        minHeight="7em" height="7em" maxHeight="7em"
                                        p={(this.timeline_spacing) ? 0 : 3 }
                                        position="relative"
                                        display={`${(this.timeline_spacing) ? "block" : "flex" }`}
                                        flexDirection="row" justifyContent="start"
                                    >
                                        {VAP_sets.map(VAP_set => {
                                            const sim_datetime = get_sim_datetime(VAP_set)
                                            if (!sim_datetime) return null

                                            const vap_percent = this.get_date_offset_percent(sim_datetime)
                                            return (
                                                <Box className="vap"
                                                    flexGrow={0} flexShrink={1} flexBasis="auto"
                                                    display="inline-block"
                                                    border={1}
                                                    minHeight="100%" height="100%" maxHeight="100%"
                                                    position={`${(this.timeline_spacing) ? "absolute" : "static" }`}
                                                    zIndex={1}
                                                    left={`${vap_percent}%`}
                                                >
                                                    {/* <Box component="small">{sim_datetime.toLocaleString()}</Box><br /> */}
                                                    {/* <Box component="small">{vap_percent.toFixed(2)}%</Box><br /> */}
                                                    <ConnectedValueAndPredictionSetSummary wcomponent={wc} VAP_set={VAP_set} />
                                                </Box>
                                            )
                                        })}
                                    </Box>
                                </Box>
                            )
                        })}
                        </Box>
                    </Box>
                </Box>
            </Box>
        )
    }
}

function _KnowledgeTimeView (props: Props)
{
    // const properties = get_children(props)
    let { wcomponent_nodes } = props
    const { selected_wcomponent_ids_to_ordinal_position_map } = props
    const dates: Date[] = []
    const get_key = (wc: WComponent) =>
    {
        const entry = selected_wcomponent_ids_to_ordinal_position_map[wc.id]
        if (entry !== undefined) return entry
        else return get_created_at_ms(wc)
    }
    wcomponent_nodes = sort_list(wcomponent_nodes, get_key, SortDirection.ascending)
    wcomponent_nodes.forEach(wc => {
        const VAP_sets = wcomponent_has_VAP_sets(wc) ? wc.values_and_prediction_sets : []
        VAP_sets.forEach(VAP_set =>
        {
            const dt = get_sim_datetime(VAP_set)
            dt && dates.push(dt)
        })
    })
    const date_range = new DateRange(dates, props)
    const content = date_range.render(wcomponent_nodes)
    return <MainArea main_content={(content) ? content : <Box />} />
}

export const KnowledgeTimeView = connector(_KnowledgeTimeView) as FunctionalComponent

const no_svg_upper_children: h.JSX.Element[] = []
const get_svg_upper_children = ({ wcomponent_connections }: Props) =>
{
    return null
    // if (!wcomponent_connections) return no_svg_upper_children

    // return wcomponent_connections.map(({ id }) => <WComponentCanvasConnection key={id} id={id} />)
}



function ensure_date (date: Date | undefined): Date
{
    return (date instanceof Date) ? date : new Date()
}
