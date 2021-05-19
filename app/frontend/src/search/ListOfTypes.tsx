import { Component, FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { PatternListEntry } from "../patterns/PatternListEntry"
import { StatementListEntry } from "../statements/StatementListEntry"
import type { Item, ObjectWithCache, Pattern, RootState, Statement } from "../state/State"
import { CORE_IDS } from "../state/core_data"
import { ObjectListEntry } from "../objects/ObjectListEntry"
import { is_object_id, is_pattern_id, is_statement_id } from "../shared/utils/ids"


export type ITEM_FILTERS = "simple_types" | "types" | "patterns" | "all_concrete"


interface OwnProps
{
    specific_type_id?: string
    filter_type: ITEM_FILTERS
    filtered_by_string: string
    on_click: (item: Item) => void
}


interface SearchProps
{
    search: {
        weight: number
        match: boolean
    }
}


function add_search_props (item: Statement): Statement & SearchProps
function add_search_props (item: Pattern): Pattern & SearchProps
function add_search_props (item: ObjectWithCache): ObjectWithCache & SearchProps
function add_search_props (item: Item): Item & SearchProps
{
    return {
        ...item,
        search: {
            weight: 0,
            match: true,
        }
    }
}


function map_state (state: RootState, own_props: OwnProps)
{
    const { filtered_by_string, filter_type } = own_props
    const terms = filtered_by_string.toLowerCase().split(" ")

    let statements: (Statement & SearchProps)[] = state.statements.map(i => add_search_props(i))
    let patterns: (Pattern & SearchProps)[] = state.patterns.map(i => add_search_props(i))
    let objects: (ObjectWithCache & SearchProps)[] = state.objects.map(add_search_props) as (ObjectWithCache & SearchProps)[]

    if (filter_type === "simple_types" || filter_type === "types")
    {
        statements = statements
            .filter(s => s.labels.includes(CORE_IDS.sType))
    }
    else if (filter_type === "patterns")
    {
        statements = []
    }

    statements.forEach(i => {
        terms.forEach(term => {
            const match = i.content.toLowerCase().includes(term)
                // || i.id.startsWith(term)

            if (match) i.search.weight += 1
        })
    })


    if (filter_type === "types" || filter_type === "patterns")
    {
        patterns = patterns.filter(i => {
            let any_match = false

            terms.forEach(term => {
                const match = i.name.toLowerCase().includes(term)
                    // || i.id.startsWith(term)
                    || i.content.toLowerCase().includes(term)

                if (match) i.search.weight += 1

                any_match = any_match || match
            })

            return any_match
        })
    }
    else
    {
        patterns = []
    }


    if (filter_type !== "all_concrete")
    {
        objects = []
    }

    objects = objects.filter(i => {
        let matches = 0

        terms.forEach(term => {
            const match = i.content.toLowerCase().includes(term)
                // || i.id.startsWith(term)
                || i.rendered.toLowerCase().includes(term)
                || i.pattern_name.toLowerCase().includes(term)

            matches += match ? 1 : 0
        })

        i.search.weight += matches

        return matches > 0
    })


    let items: (Item & SearchProps)[] = []

    items = items
        .concat(statements)
        .concat(patterns)
        .concat(objects)

    items.forEach(i => {
        if (!own_props.specific_type_id) return

        let matches = 0

        if (i.hasOwnProperty("labels"))
        {
            const t = i as (Statement | ObjectWithCache)
            matches += t.labels.includes(own_props.specific_type_id) ? 1 : 0
        }

        if (i.hasOwnProperty("pattern_name"))
        {
            const t = i as (ObjectWithCache)
            matches += t.pattern_id === own_props.specific_type_id ? 1 : 0
        }

        i.search.weight += matches
        i.search.match = matches > 0
    })

    let max_weight = 0
    items.forEach(i => max_weight = Math.max(max_weight, i.search.weight))

    // normalise weights
    items.forEach(i => i.search.weight = i.search.weight / max_weight)

    items = items
        .sort(({ search: { weight: a } }, { search: { weight: b } }) => a === b ? 0 : (a > b ? -1 : 1))

    return {
        // TODO memoize
        items,
    }
}


const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


interface State
{
}

class _ListOfTypes extends Component<Props, State>
{
    constructor(props: Props)
    {
        super(props)

        this.state = {
        }
    }

    render ()
    {
        return <table class="list">
            <tbody>
                {this.props.items.map(item => <tr
                    key={item.id}
                    className={item.search.match ? "match" : ""}
                    onClick={() => this.props.on_click(item)}
                >
                    <td>
                        <div style={{
                            width: 5,
                            height: `${3 + item.search.weight * 18}px`,
                            backgroundColor: `rgba(255, ${(1 - item.search.weight) * 255},0,${item.search.weight})`
                        }}></div>
                    </td>

                    { is_statement_id(item.id) && StatementListEntry({
                        statement: item as Statement,
                        on_click: () => this.props.on_click(item)
                    }) }

                    { is_pattern_id(item.id) && PatternListEntry({
                        pattern: item as Pattern,
                        on_click: () => this.props.on_click(item)
                    }) }

                    { is_object_id(item.id) && ObjectListEntry({
                        object: item as ObjectWithCache,
                        on_click: () => this.props.on_click(item)
                    }) }

                </tr>)}
                <tr>
                    <td></td>
                    <td>
                        {/* Complete hack to force table to be max width and still allow scroll */}
                        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                    </td>
                </tr>
            </tbody>
        </table>
    }
}


export const ListOfTypes = connector(_ListOfTypes) as FunctionComponent<OwnProps>
