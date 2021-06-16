import { Component, FunctionalComponent, h, Options } from "preact"
import fuzzysort from "fuzzysort"

import "./AutocompleteText.css"
import { sort_list } from "../../shared/utils/sort"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../../state/State"



interface BaseAutocompleteOption
{
    id: string | undefined
    title: string
    jsx?: h.JSX.Element
    subtitle?: string
}
interface InternalAutocompleteOption extends BaseAutocompleteOption
{
    total_text: string
}
export interface AutocompleteOption extends BaseAutocompleteOption
{
    id: string
}



export interface AutocompleteProps <E extends AutocompleteOption = AutocompleteOption>
{
    placeholder: string
    selected_option_id: string | undefined
    initial_search_term?: string
    options: E[]
    allow_none?: boolean
    on_focus?: () => void
    on_blur?: () => void
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
    temp_value_str: string | undefined
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
        this.state = {
            temp_value_str: props.initial_search_term,
            editing: !!props.start_expanded,
            highlighted_option_index: 0,
        }

        const result = prepare_options_and_targets(props.options, props.allow_none)
        this.options = result.new_internal_options
        this.prepared_targets = result.prepared_targets
    }


    async handle_key_down (e: h.JSX.TargetedKeyboardEvent<HTMLInputElement>, displayed_options: InternalAutocompleteOption[])
    {
        const key = e.key

        const is_arrow_down = key === "ArrowDown"
        const is_arrow_up = key === "ArrowUp"
        const is_enter = key === "Enter"

        let { highlighted_option_index } = this.state

        if (is_enter)
        {
            if (highlighted_option_index !== undefined)
            {
                const selected_option = displayed_options[highlighted_option_index]
                if (selected_option) await this.conditional_on_change(selected_option.id)
            }

            e.currentTarget.blur()
        }
        else if (is_arrow_down || is_arrow_up)
        {
            highlighted_option_index += (is_arrow_down ? 1 : -1)
            highlighted_option_index = highlighted_option_index % displayed_options.length
        }

        this.setState({ highlighted_option_index })
    }


    get_selected_option (): InternalAutocompleteOption | undefined
    {
        return this.options.find(({ id }) => id === this.props.selected_option_id)
    }


    get_selected_option_title_str (): string
    {
        const selected_option = this.get_selected_option()

        return selected_option ? selected_option.title : "-"
    }


    get_value_str ()
    {
        if (this.state.temp_value_str !== undefined) return this.state.temp_value_str

        return this.get_selected_option_title_str()
    }

    get_options_to_display ()
    {
        if (!this.state.temp_value_str)
        {
            return this.options
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
            this.setState({ editing: false, temp_value_str: undefined }, resolve)
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
        const value_str = this.get_value_str()

        const final_value = get_valid_value(options_to_display, value_str)
        const valid = !final_value || value_str.toLowerCase() === final_value.title.toLowerCase()

        const {
            placeholder,
            on_focus = () => {},
            on_blur = () => {},
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
                    r.focus()
                }}
                type="text"
                placeholder={placeholder}
                value={value_str}
                onFocus={e => {
                    this.setState({ editing: true })
                    on_focus()
                    // select all text
                    e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
                }}
                onChange={e => this.setState({ temp_value_str: e.currentTarget.value })}
                onKeyDown={e => this.handle_key_down(e, options_to_display)}
                onBlur={() => {
                    if (this.state.editing)
                    {
                        this.conditional_on_change(final_value ? final_value.id : undefined)
                    }

                    on_blur()
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

export function AutocompleteText <E extends AutocompleteOption> (props: OwnProps<E>)
{
    const Wrapped = connector(_AutocompleteText)
    return <Wrapped {...props} />
}



function get_valid_value (options: InternalAutocompleteOption[], value_str: string): InternalAutocompleteOption | undefined
{
    const lower_value_str = value_str.toLowerCase()

    const match = options.find(option => option.title.toLowerCase() === lower_value_str)
    if (match) return match

    return options[0]
}



interface OptionsOwnProps
{
    editing: boolean
    options_to_display: InternalAutocompleteOption[]
    is_option_wrapper_highlighted: (option: InternalAutocompleteOption, index: number) => boolean
    conditional_on_change: (option_id: string | undefined) => void
    set_highlighted_option_index: (index: number) => void
    on_mouse_over_option: (option_id: string | undefined) => void
    on_mouse_leave_option: (option_id: string | undefined) => void
}
function Options (props: OptionsOwnProps)
{
    const { editing, options_to_display, is_option_wrapper_highlighted, conditional_on_change,
        set_highlighted_option_index, on_mouse_over_option, on_mouse_leave_option, } = props

    if (options_to_display.length === 0) return null

    return <div className="options_outer" style={{ display: editing ? "" : "none" }}>
        <div className="options_inner">
            {options_to_display.map((option, index) => <div
                className={"option_wrapper " + (is_option_wrapper_highlighted(option, index) ? " highlighted " : "")}
                onMouseDown={() => conditional_on_change(option.id)}
                onMouseOver={() => {
                    set_highlighted_option_index(index)
                    on_mouse_over_option(option.id)
                }}
                onMouseLeave={() => on_mouse_leave_option(option.id)}
            >
                <div className="option">
                    {option.jsx || option.title || option.id || "none"}
                    <div className="option_subtitle">{option.subtitle}</div>
                </div>
            </div>)}
        </div>
    </div>
}



function prepare_options_and_targets (options: AutocompleteOption[], allow_none?: boolean)
{
    const new_options = [...options]

    if (allow_none)
    {
        // allow user to clear the current value / select none
        const option_none: InternalAutocompleteOption = { id: undefined, title: "-", total_text: "" }
        new_options.unshift(option_none as any)
    }

    const new_internal_options: InternalAutocompleteOption[] = new_options.map(o => ({
        ...o, total_text: o.title + (o.subtitle ? (" " + o.subtitle) : "")
    }))

    const prepared_targets = new_internal_options.map(({ total_text }) =>
    {
        return fuzzysort.prepare(total_text)
    })

    return { new_internal_options, prepared_targets}
}
