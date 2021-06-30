import { h } from "preact"
import fuzzysort from "fuzzysort"

import "./AutocompleteText.css"
import { sort_list } from "../../shared/utils/sort"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../../state/State"
import { Options } from "./Options"
import type { AutocompleteOption, InternalAutocompleteOption } from "./interfaces"
import { throttle } from "../../utils/throttle"
import { useEffect, useRef, useState } from "preact/hooks"



export interface AutocompleteProps <E extends AutocompleteOption = AutocompleteOption>
{
    placeholder?: string // TODO can remove this now that it always has a "-" in it?
    selected_option_id: string | undefined
    initial_search_term?: string
    options: E[]
    allow_none?: boolean
    on_change: (id: E["id"] | undefined) => void
    on_choose_same?: (id: E["id"] | undefined) => void
    on_mouse_over_option?: (id: E["id"] | undefined) => void
    on_mouse_leave_option?: (id: E["id"] | undefined) => void
    extra_styles?: h.JSX.CSSProperties
    start_expanded?: boolean
    always_allow_editing?: boolean
}



interface OwnProps <E extends AutocompleteOption> extends AutocompleteProps <E> {}


interface State
{
    temp_value_str: string
    editing: boolean
    highlighted_option_index: number
}



const map_state = (state: RootState) => ({
    presenting: state.display_options.consumption_formatting,
})


const connector = connect(map_state)
type Props <E extends AutocompleteOption = AutocompleteOption> = ConnectedProps<typeof connector> & OwnProps<E>



interface ActivelyChosenId {
    actively_chosen: boolean
    id: string | undefined
}



function _AutocompleteText <E extends AutocompleteOption> (props: Props<E>)
{
    const prepared_targets = useRef<(Fuzzysort.Prepared | undefined)[]>([])
    const options = useRef<InternalAutocompleteOption[]>([])
    useEffect(() =>
    {
        const results = prepare_options_and_targets(props.options)
        prepared_targets.current = results.prepared_targets
        options.current = results.new_internal_options
    })


    const actively_selected_option = useRef<ActivelyChosenId>({ actively_chosen: false, id: undefined })


    const selected_title = get_selected_option_title_str()


    const [temp_value_str, set_temp_value_str] = useState("")
    useEffect(() =>
    {
        set_temp_value_str(props.initial_search_term || selected_title || "")
    }, [props.initial_search_term, selected_title])


    const [editing_options, set_editing_options] = useState(false)
    useEffect(() =>
    {
        set_editing_options(!!props.start_expanded)
    }, [props.start_expanded])


    const [highlighted_option_index, set_highlighted_option_index] = useState(0)


    function get_selected_option_title_str (): string
    {
        const selected_option = get_selected_option(props, props.options)

        return selected_option ? selected_option.title : "-"
    }


    const handle_on_change = throttle((new_value: string) => set_temp_value_str(new_value), 300).throttled


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


    function get_options_to_display (): InternalAutocompleteOption[]
    {
        // allow user to clear the current value / select none
        const option_none: InternalAutocompleteOption = { id: undefined, title: "-", total_text: "" }

        if (!temp_value_str)
        {
            if (props.allow_none) return [option_none, ...options.current]
            else return options.current
        }


        const search_options = {
            limit: 100, // don't return more results than we need
            allowTypo: true,
            threshold: -10000, // don't return bad results
        }
        const results = fuzzysort.go(temp_value_str, prepared_targets.current, search_options)

        const map_target_to_score: { [target: string]: number } = {}
        results.forEach(({ target, score }) => map_target_to_score[target] = score)

        const options_to_display: InternalAutocompleteOption[] = sort_list(options.current, o =>
            {
                const score = map_target_to_score[o.total_text]
                return score === undefined ? -10000 : score
            }, "descending")

        return options_to_display
    }


    const set_to_not_editing = () =>
    {
        set_editing_options(false)
        set_temp_value_str(get_selected_option_title_str())
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



    const options_to_display = get_options_to_display()

    const final_value = get_valid_value(options_to_display, temp_value_str)
    const valid = !final_value || temp_value_str.toLowerCase() === final_value.title.toLowerCase()

    const {
        placeholder,
        on_mouse_over_option = () => {},
        on_mouse_leave_option = () => {},
    } = props


    return <div
        class={"editable_field autocomplete " + (valid ? "" : "invalid ")}
        style={props.extra_styles}
    >
        <input
            disabled={props.always_allow_editing ? false : props.presenting}
            ref={r =>
            {
                if (!r) return
                else if (!editing_options) setTimeout(() => r.blur(), 0)
                else setTimeout(() => r.focus(), 0)
            }}
            type="text"
            placeholder={placeholder}
            value={temp_value_str}
            onFocus={e => {
                set_editing_options(true)

                // select all text
                e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
            }}
            onChange={e => handle_on_change(e.currentTarget.value)}
            onKeyDown={e => handle_key_down(e, options_to_display)}
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



function prepare_options_and_targets (options: AutocompleteOption[])
{
    const new_internal_options: InternalAutocompleteOption[] = options
        .filter(({ is_hidden }) => !is_hidden)
        .map(o => ({
            ...o, total_text: o.title + (o.subtitle ? (" " + o.subtitle) : "")
        }))

    const prepared_targets = new_internal_options.map(({ total_text }) =>
    {
        return fuzzysort.prepare(total_text)
    })

    return { new_internal_options, prepared_targets}
}
