import { h } from "preact"
import { TextField } from "@material-ui/core"
import FlexSearch, { Index } from "flexsearch"
import fuzzysort from "fuzzysort"
import { useRef, useEffect, useState, useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import "./AutocompleteText.css"
import { sort_list, SortDirection } from "../../shared/utils/sort"
import { ACTIONS } from "../../state/actions"
import type { SearchFields, SearchType } from "../../state/search/state"
import type { RootState } from "../../state/State"
import { throttle } from "../../utils/throttle"
import type { AutocompleteOption, InternalAutocompleteOption } from "./interfaces"
import { Options } from "./Options"



export interface AutocompleteProps <E extends AutocompleteOption = AutocompleteOption>
{
    placeholder?: string // TODO can remove this now that it always has a "-" in it?
    selected_option_id: string | undefined
    initial_search_term?: string
    options: E[]
    allow_none?: boolean
    show_none_when_none?: boolean
    on_change: (id: E["id"] | undefined) => void
    on_choose_same?: (id: E["id"] | undefined) => void
    on_mouse_over_option?: (id: E["id"] | undefined) => void
    on_mouse_leave_option?: (id: E["id"] | undefined) => void
    extra_styles?: h.JSX.CSSProperties
    start_expanded?: boolean
    force_editable?: boolean
    retain_invalid_search_term_on_blur?: boolean
    search_fields?: SearchFields
    search_type?: SearchType
    set_search_type_used?: (search_type_used: SearchType | undefined) => void
    threshold_minimum_score?: false | number
    retain_options_order?: boolean
}



interface OwnProps <E extends AutocompleteOption> extends AutocompleteProps <E> {}



// Use partial<RootState> for now as a quick hack to allow this component to be used
// in other applications with a different interfacee for the store's state
const map_state = (state: Partial<RootState>) => ({
    presenting: state.display_options?.consumption_formatting,
})

const map_dispatch = {
    set_editing_text_flag: ACTIONS.user_activity.set_editing_text_flag,
}


const connector = connect(map_state, map_dispatch)
type Props <E extends AutocompleteOption = AutocompleteOption> = ConnectedProps<typeof connector> & OwnProps<E>



interface ActivelyChosenId {
    actively_chosen: boolean
    id: string | undefined
}



function _AutocompleteText <E extends AutocompleteOption> (props: Props<E>)
{

    const prepared_targets = useRef<(Fuzzysort.Prepared | undefined)[]>([])
    const flexsearch_index = useRef<Index<{}>>(((FlexSearch as any).Index as typeof FlexSearch.create)())
    const internal_options = useRef<InternalAutocompleteOption[]>([])
    useEffect(() =>
    {
        const limited_new_internal_options = prepare_options(props.options, 200, props.search_fields)
        const _prepared_targets = prepare_targets(limited_new_internal_options)
        prepared_targets.current = _prepared_targets

        limited_new_internal_options.forEach(o =>
        {
            flexsearch_index.current = flexsearch_index.current.add(o.id_num, o.unlimited_total_text)
        })

        internal_options.current = limited_new_internal_options
    }, [props.options, props.search_fields])


    const actively_selected_option = useRef<ActivelyChosenId>({ actively_chosen: false, id: undefined })


    const selected_title = get_selected_option_title_str()


    const [temp_value_str, set_temp_value_str] = useState("")
    useEffect(() =>
    {
        set_temp_value_str(props.initial_search_term || selected_title)
    }, [props.initial_search_term, selected_title])
    const { throttled: handle_on_change, flush: flush_temp_value_str } = throttle(set_temp_value_str, 300)


    const [editing_options, _set_editing_options] = useState(false)
    function set_editing_options (new_editing_options: boolean)
    {
        if (new_editing_options === editing_options) return
        _set_editing_options(new_editing_options)
        props.set_editing_text_flag(new_editing_options)
    }

    useEffect(() =>
    {
        set_editing_options(!!props.start_expanded)
    }, [props.start_expanded])


    const { threshold_minimum_score = false } = props

    const [options_to_display, set_options_to_display] = useState<InternalAutocompleteOption[]>([])
    useEffect(() =>
    {
        const result = get_options_to_display({
            temp_value_str,
            allow_none: !!props.allow_none,
            show_none_when_none: !!props.show_none_when_none,
            options: internal_options.current,
            prepared_targets: prepared_targets.current,
            flexsearch_index: flexsearch_index.current,
            search_type: props.search_type || "best",
            threshold_minimum_score: threshold_minimum_score,
            retain_options_order: props.retain_options_order || false
        })
        set_options_to_display(result.options)
        props.set_search_type_used && props.set_search_type_used(result.search_type_used)
        flush_temp_value_str()
    }, [temp_value_str, props.allow_none, props.show_none_when_none, internal_options.current, prepared_targets.current, flexsearch_index.current, props.search_type, threshold_minimum_score])



    const [highlighted_option_index, set_highlighted_option_index] = useState(0)

    const moused_over_options = useRef(new Set<string>())
    const on_mouse_over_option = useMemo(() =>
    {
        return (id: string | undefined) =>
        {
            id && moused_over_options.current.add(id)
            props.on_mouse_over_option && props.on_mouse_over_option(id)
        }
    }, [props.on_mouse_over_option])

    const on_mouse_leave_option = useMemo(() =>
    {
        return (id: string | undefined) =>
        {
            id && moused_over_options.current.delete(id)
            props.on_mouse_leave_option && props.on_mouse_leave_option(id)
        }
    }, [props.on_mouse_leave_option])


    function get_selected_option_title_str (): string
    {
        const selected_option = get_selected_option(props, props.options)

        return selected_option ? selected_option.title : ""
    }


    const handle_key_down = async (e: h.JSX.TargetedKeyboardEvent<HTMLInputElement>, displayed_options: InternalAutocompleteOption[]) =>
    {
        const key = e.key

        const is_arrow_down = key === "ArrowDown"
        const is_arrow_up = key === "ArrowUp"
        const is_enter = key === "Enter"
        const is_escape = key === "Escape"


        if (is_enter || is_escape)
        {
            if (is_enter && highlighted_option_index !== undefined)
            {
                const selected_option = displayed_options[highlighted_option_index]
                if (selected_option) conditional_on_change(selected_option.id)
            }
            else if (is_escape)
            {
                conditional_on_change(props.selected_option_id)
            }
        }
        else if (is_arrow_down || is_arrow_up)
        {
            let new_highlighted_option_index = highlighted_option_index + (is_arrow_down ? 1 : -1)
            new_highlighted_option_index = new_highlighted_option_index % displayed_options.length
            set_highlighted_option_index(new_highlighted_option_index)
        }
    }


    const set_to_not_editing = () =>
    {
        set_editing_options(false)
        !props.retain_invalid_search_term_on_blur && set_temp_value_str(get_selected_option_title_str())
        set_highlighted_option_index(0)
    }


    const conditional_on_change = (id: string | undefined) =>
    {
        set_to_not_editing() // will trigger blur and that calls `handle_on_blur`
        actively_selected_option.current = { actively_chosen: true, id }
    }


    const handle_on_blur = () =>
    {
        set_to_not_editing()

        const { on_mouse_leave_option } = props
        if (on_mouse_leave_option)
        {
            // Ensure on_mouse_leave_option is called for any ids remaining
            moused_over_options.current.forEach(id => on_mouse_leave_option(id))
            moused_over_options.current = new Set()
        }

        const { actively_chosen, id } = actively_selected_option.current
        if (!actively_chosen) return
        actively_selected_option.current = { actively_chosen: false, id: undefined }

        const original_id = props.selected_option_id
        if (original_id === id)
        {
            props.on_choose_same && props.on_choose_same(id)
        }
        else
        {
            props.on_change(id)
        }
    }


    const final_value = get_valid_value(options_to_display, temp_value_str)
    const valid = (!final_value && props.allow_none) || temp_value_str.toLowerCase() === final_value?.title.toLowerCase()


    return <div
        class={"editable_field autocomplete " + (valid ? "" : "invalid ")}
        style={props.extra_styles}
    >
        <TextField
            disabled={props.force_editable !== undefined ? !props.force_editable : props.presenting}
            ref={((el: HTMLDivElement) =>
            {
                if (!el) return
                const input_el = el.getElementsByTagName("input")[0]
                if (!input_el) return

                if (!editing_options) setTimeout(() => input_el.blur(), 0)
                else setTimeout(() => input_el.focus(), 0)
            }) as any}
            // type="text"
            placeholder={props.placeholder}
            value={temp_value_str || (editing_options ? "" : "-")}
            onFocus={(e: h.JSX.TargetedFocusEvent<HTMLInputElement>) => {
                setTimeout(() => set_editing_options(true), 0)
                e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
            }}
            onChange={(e: h.JSX.TargetedEvent<HTMLInputElement, Event>) => handle_on_change(e.currentTarget.value)}
            onKeyDown={(e: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => handle_key_down(e, options_to_display)}
            onBlur={() => handle_on_blur()}
        />

        <Options
            editing_options={editing_options}
            options_to_display={options_to_display}
            is_option_wrapper_highlighted={(_, index) => index === highlighted_option_index}
            conditional_on_change={conditional_on_change}
            set_highlighted_option_index={set_highlighted_option_index}
            on_mouse_over_option={on_mouse_over_option}
            on_mouse_leave_option={on_mouse_leave_option}
        />
    </div>
}
const ConnectedAutocompleteText = connector(_AutocompleteText)


export function AutocompleteText <E extends AutocompleteOption> (props: OwnProps<E>)
{
    return <ConnectedAutocompleteText {...props} />
}



// We use the initial `AutocompleteOption` options to allow for display the text
// of a selected but normally hidden option
function get_selected_option (props: Props, options: AutocompleteOption[]): AutocompleteOption | undefined
{
    if (props.selected_option_id === undefined)
    {
        return props.allow_none ? undefined : options[0]
    }

    return options.find(({ id }) => id === props.selected_option_id)
}



function get_valid_value (options: InternalAutocompleteOption[], value_str: string): InternalAutocompleteOption | undefined
{
    const lower_value_str = value_str.toLowerCase()

    const match = options.find(option => option.title.toLowerCase() === lower_value_str)
    if (match) return match

    return options[0]
}



function prepare_options (options: AutocompleteOption[], limit: number, search_fields: SearchFields = "all")
{
    let id_num = 1
    const all = search_fields === "all"

    const new_internal_options: InternalAutocompleteOption[] = options
        .filter(({ is_hidden }) => !is_hidden)
        .map(o =>
        {
            // limiting length due to: https://github.com/farzher/fuzzysort/issues/80
            const limited_total_text = get_total_text(o, limit, all)
            const unlimited_total_text = get_total_text(o, 0, all)

            return { ...o, limited_total_text, unlimited_total_text, id_num: id_num++ }
        })

    return new_internal_options
}



function get_total_text (o: AutocompleteOption, limit: number, all: boolean)
{
    let total_text = limit_string_length(o.title, limit)

    if (all) total_text += (o.subtitle ? (" " + limit_string_length(o.subtitle, limit)) : "")
    else total_text += (o.raw_title ? (" " + limit_string_length(o.raw_title, limit)) : "")

    return total_text
}



function limit_string_length (str: string, limit?: number)
{
    if (!limit) return str

    return str.slice(0, limit) + (str.length > limit ? "..." : "")
}



function prepare_targets (new_internal_options: InternalAutocompleteOption[])
{
    return new_internal_options.map(({ limited_total_text: total_text }) => fuzzysort.prepare(total_text))
}



const OPTION_NONE: InternalAutocompleteOption = {
    id: undefined,
    id_num: 0,
    title: "(clear)",
    limited_total_text: "clear",
    unlimited_total_text: "",
}


interface GetOptionsToDisplayArgs
{
    temp_value_str: string
    allow_none: boolean
    show_none_when_none: boolean
    options: InternalAutocompleteOption[]
    prepared_targets: (Fuzzysort.Prepared | undefined)[]
    flexsearch_index: Index<{}>
    search_type: SearchType
    threshold_minimum_score: false | number
    retain_options_order: boolean
}
interface GetOptionsToDisplayReturn
{
    options: InternalAutocompleteOption[]
    search_type_used: SearchType | undefined
}
function get_options_to_display (args: GetOptionsToDisplayArgs): GetOptionsToDisplayReturn
{
    const {
        temp_value_str,
        allow_none,
        show_none_when_none,
        prepared_targets,
        flexsearch_index,
        search_type,
        threshold_minimum_score,
        retain_options_order,
    } = args
    let { options } = args

    let search_type_used: SearchType | undefined = undefined

    if (!temp_value_str)
    {
        // Allow user to clear the current value & select none.  This works by allowing them to delete all
        // the text in the autocomplete field, at which point the `OPTION_NONE` is added.
        //
        // We may want to disable this conditional on `allow_none` and always return `options`.  However without
        // this conditional it is not possible to clear an option once it is set as the `OPTION_NONE` is
        // never added to the list of options.
        options = allow_none ? [OPTION_NONE, ...options] : options

        return { options, search_type_used }
    }


    let option_to_exact_score = (option: InternalAutocompleteOption) => 0
    let option_to_score = (option: InternalAutocompleteOption) => 0
    let exact_results = 0


    if (search_type === "best" || search_type === "exact")
    {
        search_type_used = "exact"

        const results = (flexsearch_index as any).search(temp_value_str) as number[]
        exact_results = results.length
        const id_num_to_score: { [id_num: number]: number } = {}
        results.forEach((id, index) => id_num_to_score[id] = 10000 - index)
        option_to_exact_score = o => id_num_to_score[o.id_num] || -10000
    }


    if (exact_results < 10 && (search_type === "best" || search_type === "fuzzy"))
    {
        search_type_used = "fuzzy"

        const search_options = {
            limit: 100, // don't return more results than we need
            allowTypo: true,
            threshold: -10000, // don't return bad results
        }

        const results = fuzzysort.go(temp_value_str, prepared_targets, search_options)

        const map_target_to_score: { [target: string]: number } = {}
        results.forEach(({ target, score }) => map_target_to_score[target] = score)

        option_to_score = o =>
        {
            const score = map_target_to_score[o.limited_total_text]
            return score === undefined ? option_to_exact_score(o) : score
        }
    }
    else option_to_score = option_to_exact_score


    const filterd_options = threshold_minimum_score === false
        ? options
        : options.filter(o => option_to_score(o) > threshold_minimum_score)

    let options_to_display = filterd_options
    if (!retain_options_order) options_to_display = sort_list(filterd_options, option_to_score, SortDirection.descending)
    if (allow_none && show_none_when_none) options_to_display = [OPTION_NONE, ...options_to_display]

    return { options: options_to_display, search_type_used }
}
