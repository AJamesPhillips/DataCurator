import { Component, h } from "preact"
import fuzzysort from "fuzzysort"

import "./AutocompleteText.css"
import { sort_list } from "../utils/sort"



export interface AutoCompleteOption
{
    id: string | undefined
    title: string
}


export interface AutoCompleteProps <E extends AutoCompleteOption>
{
    placeholder: string
    selected_option_id: string | undefined
    get_options: (current_value: string) => E[]
    allow_none?: boolean
    on_focus?: () => void
    on_blur?: () => void
    on_change: (id: E["id"] | undefined) => void
    on_mouse_over_option?: (id: E["id"] | undefined) => void
    on_mouse_leave_option?: (id: E["id"] | undefined) => void
    extra_styles?: h.JSX.CSSProperties
    start_expanded?: boolean
}



interface OwnProps <E extends AutoCompleteOption> extends AutoCompleteProps<E> {}


interface State
{
    temp_value_str: string | undefined
    editing: boolean
    highlighted_option_index: number | undefined
}

export class AutocompleteText <E extends AutoCompleteOption> extends Component <OwnProps<E>, State>
{
    private original_options: E[] = []
    private options: E[] = []
    private prepared_targets: (Fuzzysort.Prepared | undefined)[] = []

    constructor (props: OwnProps<E>)
    {
        super(props)
        this.state = {
            temp_value_str: undefined,
            // option_id: props.selected_option_id,
            editing: !!props.start_expanded,
            highlighted_option_index: undefined,
        }
    }


    async handle_key_down (e: h.JSX.TargetedKeyboardEvent<HTMLInputElement>, displayed_options: E[])
    {
        const key = e.key

        const is_arrow_down = key === "ArrowDown"
        const is_arrow_up = key === "ArrowUp"
        const is_enter = key === "Enter"

        let { highlighted_option_index } = this.state

        if (!(is_arrow_down || is_arrow_up || is_enter))
        {
            highlighted_option_index = undefined
        }
        else if (is_enter)
        {
            if (highlighted_option_index !== undefined)
            {
                const selected_id = displayed_options[highlighted_option_index].id
                await this.conditional_on_change(selected_id)
            }

            e.currentTarget.blur()
        }
        else if (highlighted_option_index === undefined) highlighted_option_index = 0
        else
        {
            highlighted_option_index += (is_arrow_down ? 1 : -1)
            highlighted_option_index = highlighted_option_index % displayed_options.length
        }

        this.setState({ highlighted_option_index })
    }


    get_selected_option_title (): string
    {
        const selected_option = this.props.get_options("").find(({ id }) => id === this.props.selected_option_id)

        return selected_option ? selected_option.title : "-"
    }


    get_value_str ()
    {
        if (this.state.temp_value_str !== undefined) return this.state.temp_value_str

        return this.get_selected_option_title()
    }


    get_options_to_display ()
    {
        const new_options = this.props.get_options(this.state.temp_value_str || "")

        if (new_options !== this.original_options)
        {
            this.original_options = new_options
            this.options = [...new_options]
            if (this.props.allow_none)
            {
                // allow user to clear the current value / select none
                const option_none: AutoCompleteOption = { id: undefined, title: "-" }
                this.options.unshift(option_none as any)
            }
            this.prepared_targets = this.options.map(o => fuzzysort.prepare(o.title))
        }


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

        const options_to_display: E[] = sort_list(this.options, o => map_target_to_score[o.title] === undefined ? -10000 : map_target_to_score[o.title], "descending")

        return options_to_display
    }


    async conditional_on_change (id: E["id"] | undefined) {
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
        const valid = value_str.toLowerCase() === final_value.title.toLowerCase()

        const {
            placeholder,
            on_focus = () => {},
            on_blur = () => {},
            on_mouse_over_option = () => {},
            on_mouse_leave_option = () => {},
        } = this.props


        const is_option_wrapper_highlighted = (option: E, index: number) =>
        {
            const { highlighted_option_index } = this.state
            if (highlighted_option_index !== undefined) return index === highlighted_option_index

            return option.id === final_value.id
        }


        return <div
            class={"editable_field autocomplete " + (valid ? "" : "invalid ")}
            style={this.props.extra_styles}
        >
            <input
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
                    if (this.state.editing) this.conditional_on_change(final_value.id)

                    on_blur()
                }}
            />
            <div className="options_outer" style={{ display: this.state.editing ? "" : "none" }}>
                <div className="options_inner">
                    {options_to_display.map((option, index) => <div
                        className={"option_wrapper " + (is_option_wrapper_highlighted(option, index) ? " highlighted " : "")}
                        onMouseDown={() => this.conditional_on_change(option.id)}
                        onMouseOver={() => {
                            this.setState({ highlighted_option_index: index })
                            on_mouse_over_option(option.id)
                        }}
                        onMouseLeave={() => on_mouse_leave_option(option.id)}
                    >
                        <div className="option">{option.title}</div>
                    </div>)}
                </div>
            </div>
        </div>
    }
}


function get_valid_value <E extends AutoCompleteOption> (options: E[], value_str: string): E
{
    const lower_value_str = value_str.toLowerCase()

    for (let i = 0; i < options.length; ++i) {
        const option = options[i]

        if (option.title.toLowerCase() === lower_value_str) return option
    }

    return options[0]
}
