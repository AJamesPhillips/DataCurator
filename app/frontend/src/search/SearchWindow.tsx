import { h } from "preact"

import { Modal } from "../modal/Modal"
import { AutocompleteProps, AutocompleteText, SearchType } from "../form/Autocomplete/AutocompleteText"
import { useState } from "preact/hooks"



interface OwnProps extends AutocompleteProps {
    search_window_title: string
    on_blur: () => void
}


export function SearchWindow (props: OwnProps)
{
    const [search_type, set_search_type] = useState<SearchType>("either")
    const [search_type_used, set_search_type_used] = useState<SearchType | undefined>(undefined)
    const toggle_search_type = () => set_search_type(search_type === "exact" ? "fuzzy" : (search_type === "fuzzy" ? "either" : "exact"))

    return <Modal
        on_close={() => props.on_blur && props.on_blur()}
        title={props.search_window_title}
        child={<div>
            <br />
            <br />

            <div onClick={toggle_search_type} style={{ cursor: "pointer" }}>
                Search type:
                <input type="radio" checked={search_type === "exact"} />Exact
                <input type="radio" checked={search_type === "fuzzy"} />Approximate (slow &amp; title only)
                <input type="radio" checked={search_type === "either"} />Best (exact then approximate)
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
                search_type={search_type}
                set_search_type_used={set_search_type_used}
            />
        </div>}
    />
}
