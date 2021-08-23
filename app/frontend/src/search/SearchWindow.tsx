import { h } from "preact"
import { useState } from "preact/hooks"

import { AutocompleteProps, AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import { Modal } from "../modal/Modal"
import type { SearchFields, SearchType } from "../state/search/state"



interface OwnProps extends AutocompleteProps {
    search_window_title: string
    on_blur: () => void
}


export function SearchWindow (props: OwnProps)
{
    const [search_fields, set_search_fields] = useState<SearchFields>("all")
    const [search_type, set_search_type] = useState<SearchType>("best")
    const [search_type_used, set_search_type_used] = useState<SearchType | undefined>(undefined)


    return <Modal
        on_close={() => props.on_blur && props.on_blur()}
        title={props.search_window_title}
        child={<div>
            <br />
            <br />

            <div>
                Search type:
                <RadioOption
                    selected_option={search_type}
                    option="exact"
                    set_option={set_search_type}
                    option_text="Exact"
                />
                <RadioOption
                    selected_option={search_type}
                    option="fuzzy"
                    set_option={set_search_type}
                    option_text="Approximate (slow &amp; title only)"
                />
                <RadioOption
                    selected_option={search_type}
                    option="best"
                    set_option={set_search_type}
                    option_text="Best (exact then approximate)"
                />
            </div>

            <div>
                Search over:
                <RadioOption
                    selected_option={search_fields}
                    option="all"
                    set_option={set_search_fields}
                    option_text="All fields"
                />
                <RadioOption
                    selected_option={search_fields}
                    option="title"
                    set_option={set_search_fields}
                    option_text="Title only"
                />
            </div>

            <div style={{ opacity: search_type_used ? 0.7 : 0 }}>
                Used: {search_type_used}
            </div>

            <AutocompleteText
                placeholder={props.placeholder}
                selected_option_id={props.selected_option_id}
                initial_search_term={props.initial_search_term}
                options={props.options}
                allow_none={props.allow_none}
                on_change={option_id =>
                {
                    props.on_change(option_id)
                    props.on_blur && props.on_blur()
                }}
                on_mouse_over_option={props.on_mouse_over_option}
                on_mouse_leave_option={props.on_mouse_leave_option}
                extra_styles={props.extra_styles}
                start_expanded={true}
                retain_invalid_search_term_on_blur={true}
                search_fields={search_fields}
                search_type={search_type}
                set_search_type_used={set_search_type_used}
            />
        </div>}
    />
}



interface RadioOptionProps<O>
{
    selected_option: O
    option: O
    option_text: string
    set_option: (option: O) => void
}
function RadioOption <O> (props: RadioOptionProps<O>)
{
    return <span onClick={() => props.set_option(props.option)} style={{ cursor: "pointer" }}>
        <input type="radio" checked={props.selected_option === props.option} />{props.option_text}
    </span>
}
