import { FunctionalComponent, h, render } from "preact"

import "./KnowledgeTimeView.scss"
import type { ChildrenRawData } from "../layout/interfaces"
import type { RootState } from "../state/State"
import { WComponentCanvasNode } from "../knowledge/canvas_node/WComponentCanvasNode"
import { MainArea } from "../layout/MainArea"
import { connect, ConnectedProps } from "react-redux"
import { sort_list } from "../shared/utils/sort"
import { WComponent, wcomponent_has_VAP_sets } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_created_at_ms } from "../shared/wcomponent/utils_datetime"
import { Box, Mark, Slider } from "@material-ui/core"
import { ConnectedValueAndPredictionSetSummary } from "../knowledge/multiple_values/ConnectedValueAndPredictionSetSummary"


const map_state = (state: RootState) =>
{
    const sync_ready = state.sync.ready

    const { current_composed_knowledge_view: current_composed_knowledge_view } = state.derived

    if (sync_ready && !current_composed_knowledge_view) console .log(`No current_composed_knowledge_view`)


    const { selected_wcomponent_ids_map } = state.meta_wcomponents


    let wcomponent_nodes: WComponent[] = []
    if (current_composed_knowledge_view)
    {
        wcomponent_nodes = current_composed_knowledge_view.wcomponent_nodes
    }


    return {
        sync_ready,
        wcomponent_nodes,
        wcomponent_connections: current_composed_knowledge_view && current_composed_knowledge_view.wcomponent_connections,
        presenting: state.display_options.consumption_formatting,
        selected_wcomponent_ids_map,
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>

class DateRange {
    _ms(ms:number, convert:boolean=true):any {
        const operator = (convert) ? "/" : "*"
        return {
            milliseconds: ms,
            get seconds() { return eval(`${ms} ${operator} 1000`) },
            get minutes() { return eval(`${this.seconds} ${operator} 60`) },
            get hours() { return eval(`${this.minutes} ${operator} 60`) },
            get days() { return eval(`${this.hours} ${operator} 24`) },
            get months() { return eval(`${this.days} ${operator} 365 / 12`) },
            get years() { return eval(`${this.days} ${operator} 365`) },
            // get weeks() { return eval(`${this.days} ${operator} 7`) },
        }
    }
    scale:string = "months"
    single_time_units = this._ms(1, false)
    scales:string[] = Object.keys(this.single_time_units)
    get scale_index():number { return this.scales.indexOf(this.scale) }

    dates:Date[] = []

    get range_dates():Date[] {
        let dates:Date[] = []
        let current_date = this.round_date(new Date(this.start_date.getTime()))
        const date_prop_fns = this.get_date_prop_func_names(this.scale)
        dates.push(new Date(current_date.getTime()))
        while (current_date.getTime() <= this.end_date.getTime()) {
            Object(current_date)[date_prop_fns.set](Object(current_date)[date_prop_fns.get]() + 1)
            if (current_date.getTime() >= this.end_date.getTime()) {
                this.round_date(current_date, this.scale, true)
            }
            dates.push(new Date(current_date.getTime()))
        }
        return dates
    }

    get start_date():Date {
        const d:any = this.dates.slice(0)[0]
        return (typeof d === typeof (new Date())) ? d : new Date()
    }
    get end_date():Date {
        const d:any = this.dates.slice(-1)[0]
        return (typeof d === typeof (new Date())) ? d : new Date()
    }

    get range_start_date():Date {
        const d:any = this.range_dates.slice(0)[0]
        return (typeof d === typeof (new Date())) ? d : new Date()
    }

    get range_end_date():Date {
        const d:any = this.range_dates.slice(-1)[0]
        return (typeof d === typeof (new Date())) ? d : new Date()
    }

    date_offset_percent(date:Date) {
        let percent:number = 0;
        if (this.start_date && this.end_date) {
            percent = ((date.getTime() - this.range_start_date.getTime()) / (this.range_end_date.getTime() - this.range_start_date.getTime())) * 100
        }
        return percent.toFixed(0)
    }

    get_date_prop_func_names(date_unit:string):Record<string, any> {
        let getter, setter:string|null = null
        const prop_name: string = date_unit.charAt(0).toUpperCase() + date_unit.slice(1)
        const date:Date = new Date()
        const default_getter_name:string = `get${prop_name}`
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

    round_date(date:Date, scale:string=this.scale, round_up:boolean = false):Date {
        let rounded_date = new Date(date.getTime())
        this.scales.forEach((scale, i) => {
            const date_prop_fns = this.get_date_prop_func_names(scale)
            if (round_up) {
                if (i === this.scale_index) {
                    const current_value = Object(rounded_date)[date_prop_fns.get]()
                    Object(rounded_date)[date_prop_fns.set](current_value + 1)
                }
            } else {
                if (i < this.scale_index) {
                    const adjusted_value = (scale === 'days') ? 1 : 0
                    if (date_prop_fns.set && Object(rounded_date)[date_prop_fns.set]) {
                        Object(rounded_date)[date_prop_fns.set](adjusted_value)
                    }
                }
            }
        })
        return rounded_date
    }

    constructor(dates:Date[]) {
        this.dates = dates.sort((a:Date, b:Date) => a.getTime() - b.getTime())
    }
    render(wcomponent_nodes:any[]) {
        return(
            <Box className={`time_view`} flexGrow={1}>
                <Box className={`visible_timeline ${this.scale}`} display="flex" maxWidth="100%" overflowX="hidden">
                    {
                        this.range_dates.map((date:Date, i:number) => {
                            let next_date = (this.range_dates.length >= i + 1) ? this.range_dates[i + 1] : null
                            let start_percent:number = parseInt(this.date_offset_percent(date))
                            let flex_basis = "auto"
                            if (next_date) {
                                let end_percent:number = parseInt(this.date_offset_percent(next_date))
                                flex_basis = `${end_percent - start_percent}%`
                            }
                            return (
                                <Box
                                    bgcolor="white"
                                    className="unit"
                                    boxSizing="border-box" p={5}
                                    flexGrow={1} flexShrink={(flex_basis === "auto") ? 1 : 0} flexBasis={flex_basis}
                                    textAlign="center"
                                >
                                    <Box component="span">{date.toDateString()}</Box>
                                </Box>
                            )
                        })
                    }
                </Box>
                {wcomponent_nodes.map(wc => {
                    const VAP_sets = wcomponent_has_VAP_sets(wc) ? wc.values_and_prediction_sets : []
                    const wc_percent = this.date_offset_percent(wc.created_at)
                    return (
                        <Box m={5} id={`WC-${wc.id}`} position="relative">
                            <Box className="wc" display="inline-block" position="relative" left={`${wc_percent}%`} textAlign="right">
                                {/* {wc_percent} {wc.created_at.toLocaleString()} */}
                                <WComponentCanvasNode id={wc.id} on_graph={false} />
                            </Box>
                            <Box>
                                {VAP_sets.map(VAP => {
                                    const vap_percent = this.date_offset_percent(VAP.created_at)
                                    return (
                                        <Box className="vap" display="inline-block"  position="relative" left={`${vap_percent}%`}>
                                            {/* {vap_percent} */}
                                            <ConnectedValueAndPredictionSetSummary wcomponent={wc} VAP_set={VAP} />
                                        </Box>
                                    )
                                })}
                            </Box>
                        </Box>
                    )
                })}
            </Box>
        )
    }
}

function _KnowledgeTimeView (props: Props)
{
    // const properties = get_children(props)
    let { wcomponent_nodes } = props
    const { selected_wcomponent_ids_map } = props
    const dates: Date[] = []
    const get_key = (wc: WComponent) =>
    {
        const entry = selected_wcomponent_ids_map[wc.id]
        if (entry !== undefined) return entry
        else return get_created_at_ms(wc)
    }
    wcomponent_nodes = sort_list(wcomponent_nodes, get_key, "ascending")
    wcomponent_nodes.forEach(wc => {
        const VAP_sets = wcomponent_has_VAP_sets(wc) ? wc.values_and_prediction_sets : []
        dates.push(wc.created_at)
        VAP_sets.forEach(VAP => {
            dates.push(VAP.created_at)
        })
    })
    let date_range = new DateRange(dates)
    return <MainArea main_content={date_range.render(wcomponent_nodes)} />
}

export const KnowledgeTimeView = connector(_KnowledgeTimeView) as FunctionalComponent<{}>

// const no_children: h.JSX.Element[] = []
// const get_children = (props: Props): ChildrenRawData =>
// {
//     const { sync_ready } = props
//     let { wcomponent_nodes } = props
//     if (!sync_ready || !wcomponent_nodes)
//     {
//         return no_children
//     }


//     const { selected_wcomponent_ids_map } = props
//     const get_key = (wc: WComponent) =>
//     {
//         const entry = selected_wcomponent_ids_map[wc.id]

//         if (entry !== undefined) return entry
//         else return get_created_at_ms(wc)
//     }

//     wcomponent_nodes = sort_list(wcomponent_nodes, get_key, "ascending")


//     const elements: h.JSX.Element[] = []
//     wcomponent_nodes.map(wc =>
//     {
//         const VAP_sets = wcomponent_has_VAP_sets(wc) ? wc.values_and_prediction_sets : []

//         elements.push(
//             <Box
//                 display="flex" flexDirection="row" alignItems="stretch"
//                 py="0.5em"
//                 key={wc.id}
//             >
//                 <WComponentCanvasNode
//                     id={wc.id}
//                     on_graph={false}
//                 />

//                 {VAP_sets.length > 0 && (
//                     <Box p="0.5em"
//                         flexGrow={1} flexShrink={0}
//                         display="flex" alignItems="stretch" alignContent="stretch">
//                         {VAP_sets.map(VAP_set => <ConnectedValueAndPredictionSetSummary wcomponent={wc} VAP_set={VAP_set} />)}
//                     </Box>
//                 )}
//             </Box>
//         )
//     })

//     return elements
// }


const no_svg_upper_children: h.JSX.Element[] = []
const get_svg_upper_children = ({ wcomponent_connections }: Props) =>
{
    return null
    // if (!wcomponent_connections) return no_svg_upper_children

    // return wcomponent_connections.map(({ id }) => <WComponentCanvasConnection key={id} id={id} />)
}
