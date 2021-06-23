import { Component, h } from "preact"
import fuzzysort from "fuzzysort"

import "./AutocompleteText.css"
import { sort_list } from "../../shared/utils/sort"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../../state/State"
import { Options } from "./Options"
import type { AutocompleteOption, InternalAutocompleteOption } from "./interfaces"
import { throttle } from "../../utils/throttle"



export interface AutocompleteProps <E extends AutocompleteOption = AutocompleteOption>
{
    placeholder?: string // TODO can remove this now that it always has a "-" in it?
    selected_option_id: string | undefined
    initial_search_term?: string
    options: E[]
    allow_none?: boolean
    on_change: (id: E["id"] | undefined) => void
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
type Props <E extends AutocompleteOption> = ConnectedProps<typeof connector> & OwnProps<E>



class _AutocompleteText <E extends AutocompleteOption> extends Component <Props<E>, State>
{
    private prepared_targets: (Fuzzysort.Prepared | undefined)[] = []
    private options: InternalAutocompleteOption[] = []

    constructor (props: Props<E>)
    {
        super(props)

        const result = prepare_options_and_targets(props.options)
        this.options = result.new_internal_options
        this.prepared_targets = result.prepared_targets

        const selected_title = this.get_selected_option_title_str()
        this.state = {
            temp_value_str: props.initial_search_term || selected_title || "",
            editing: !!props.start_expanded,
            highlighted_option_index: 0,
        }
    }


    handle_on_change = throttle((new_value: string) =>
    {
        this.setState({ temp_value_str: new_value })
    }, 300).throttled


    async handle_key_down (e: h.JSX.TargetedKeyboardEvent<HTMLInputElement>, displayed_options: InternalAutocompleteOption[])
    {
        const key = e.key

        const is_arrow_down = key === "ArrowDown"
        const is_arrow_up = key === "ArrowUp"
        const is_enter = key === "Enter"
        const is_escape = key === "Escape"

        const { highlighted_option_index } = this.state

        if (is_enter || is_escape)
        {
            if (is_enter && highlighted_option_index !== undefined)
            {
                const selected_option = displayed_options[highlighted_option_index]
                if (selected_option) await this.conditional_on_change(selected_option.id)
            }
            else if (is_escape)
            {
                await this.conditional_on_change(this.props.selected_option_id)
            }

            e.currentTarget.blur()
        }
        else if (is_arrow_down || is_arrow_up)
        {
            let new_highlighted_option_index = highlighted_option_index + (is_arrow_down ? 1 : -1)
            new_highlighted_option_index = new_highlighted_option_index % displayed_options.length
            this.setState({ highlighted_option_index: new_highlighted_option_index })
        }
    }


    get_selected_option (): InternalAutocompleteOption | undefined
    {
        if (this.props.selected_option_id === undefined)
        {
            return this.props.allow_none ? undefined : this.options[0]
        }

        return this.options.find(({ id }) => id === this.props.selected_option_id)
    }


    get_selected_option_title_str (): string
    {
        const selected_option = this.get_selected_option()

        return selected_option ? selected_option.title : "-"
    }


    get_options_to_display (): InternalAutocompleteOption[]
    {
        // allow user to clear the current value / select none
        const option_none: InternalAutocompleteOption = { id: undefined, title: "-", total_text: "" }

        if (!this.state.temp_value_str)
        {
            if (this.props.allow_none) return [option_none, ...this.options]
            else return this.options
        }


        const search_options = {
            limit: 100, // don't return more results than we need
            allowTypo: true,
            threshold: -10000, // don't return bad results
        }
        const results = fuzzysort.go(this.state.temp_value_str, this.prepared_targets, search_options)

        const map_target_to_score: { [target: string]: number } = {}
        results.forEach(({ target, score }) => map_target_to_score[target] = score)

        const options_to_display: InternalAutocompleteOption[] = sort_list(this.options, o =>
            {
                const score = map_target_to_score[o.total_text]
                return score === undefined ? -10000 : score
            }, "descending")

        return options_to_display
    }


    conditional_on_change = async (id: string | undefined) =>
    {
        await new Promise<void>(resolve =>
        {
            this.setState({
                editing: false,
                temp_value_str: this.get_selected_option_title_str(),
                highlighted_option_index: 0,
            }, resolve)
        })

        const original_id = this.props.selected_option_id
        if (original_id !== id)
        {
            this.props.on_change(id)
        }
    }


    render ()
    {
        const options_to_display = this.get_options_to_display()
        const value_str = this.state.temp_value_str

        const final_value = get_valid_value(options_to_display, value_str)
        const valid = !final_value || value_str.toLowerCase() === final_value.title.toLowerCase()

        const {
            placeholder,
            // on_focus = () => {},
            on_mouse_over_option = () => {},
            on_mouse_leave_option = () => {},
        } = this.props


        const is_option_wrapper_highlighted = (option: InternalAutocompleteOption, index: number): boolean =>
        {
            const { highlighted_option_index } = this.state
            return index === highlighted_option_index
        }


        return <div
            class={"editable_field autocomplete " + (valid ? "" : "invalid ")}
            style={this.props.extra_styles}
        >
            <input
                disabled={this.props.always_allow_editing ? false : this.props.presenting}
                ref={r =>
                {
                    if (!r || !this.state.editing) return
                    setTimeout(() => r.focus(), 0)
                }}
                type="text"
                placeholder={placeholder}
                value={value_str}
                onFocus={e => {
                    this.setState({ editing: true })

                    // select all text
                    e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
                }}
                onChange={e => this.handle_on_change(e.currentTarget.value)}
                onKeyDown={e => this.handle_key_down(e, options_to_display)}
                onBlur={() => {
                    this.setState({
                        editing: false,
                        temp_value_str: this.get_selected_option_title_str(),
                        highlighted_option_index: 0,
                    })
                }}
            />

            <Options
                editing={this.state.editing}
                options_to_display={options_to_display}
                is_option_wrapper_highlighted={is_option_wrapper_highlighted}
                conditional_on_change={this.conditional_on_change}
                set_highlighted_option_index={index => this.setState({ highlighted_option_index: index })}
                on_mouse_over_option={on_mouse_over_option}
                on_mouse_leave_option={on_mouse_leave_option}
            />
        </div>
    }
}
const ConnectedAutocompleteText = connector(_AutocompleteText)


export function AutocompleteText <E extends AutocompleteOption> (props: OwnProps<E>)
{
    return <ConnectedAutocompleteText {...props} />
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
    const new_internal_options: InternalAutocompleteOption[] = options.map(o => ({
        ...o, total_text: o.title + (o.subtitle ? (" " + o.subtitle) : "")
    }))

    const prepared_targets = new_internal_options.map(({ total_text }) =>
    {
        return fuzzysort.prepare(total_text)
    })

    return { new_internal_options, prepared_targets}
}
