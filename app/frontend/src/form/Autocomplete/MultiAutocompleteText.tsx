import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { useMemo } from "preact/hooks"

import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { AutocompleteText } from "./AutocompleteText"
import type { AutocompleteOption } from "./interfaces"
import { SelectedOption } from "./SelectedOption"
import { Box } from "@material-ui/core"




interface OwnProps <E extends AutocompleteOption = AutocompleteOption>
{
    placeholder: string
    selected_option_ids: string[]
    initial_search_term?: string
    options: E[]
    allow_none?: boolean
    on_focus?: () => void
    on_blur?: () => void
    on_change: (ids: E["id"][]) => void
    on_mouse_over_option?: (id: E["id"] | undefined) => void
    on_mouse_leave_option?: (id: E["id"] | undefined) => void
    extra_styles?: h.JSX.CSSProperties
    start_expanded?: boolean
    force_editable?: boolean
}



const map_state = (state: RootState, own_props: OwnProps) => ({
    editable: own_props.force_editable !== undefined ? own_props.force_editable : !state.display_options.consumption_formatting,
})

const map_dispatch = {
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(map_state, map_dispatch)
type Props<E extends AutocompleteOption> = ConnectedProps<typeof connector> & OwnProps<E>


function _MultiAutocompleteText <E extends AutocompleteOption> (props: Props<E>)
{
    const { editable, options, selected_option_ids } = props

    const { filtered_options, missing_options_by_id } = useMemo(() =>
    {
        const filtered_options = options.filter(({ id }) => !selected_option_ids.includes(id))

        const missing_options_by_id: { [id: string]: E } = {}

        if (filtered_options.length !== selected_option_ids.length)
        {
            const filtered_ids = new Set(filtered_options.map(({ id }) => id))
            const missing = selected_option_ids.filter(id => !filtered_ids.has(id))

            missing.forEach(missing_id =>
            {
                const missing_option: E = {
                    id: missing_id,
                    title: "<Label Not found>"
                } as any

                missing_options_by_id[missing_id] = missing_option
                filtered_options.push(missing_option)
            })
        }

        return { filtered_options, missing_options_by_id }
    }
    , [options, selected_option_ids])

    const options_by_id = useMemo(() =>
    {
        const inner_option_by_id: { [id: string]: E } = {
            ...missing_options_by_id,
        }
        options.forEach(option => inner_option_by_id[option.id] = option)
        return inner_option_by_id
    }, [options, missing_options_by_id])


    return (
        <Box width="100%" overflowX="hidden">
            {editable && <AutocompleteText
                {...props}
                selected_option_id={undefined}
                options={filtered_options}
                on_change={id =>
                {
                    if (id === undefined) return
                    props.on_change([...selected_option_ids, id])
                }}
                force_editable={editable}
            />}

            <div
                style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", overflow: "hidden" }}
            >
                {selected_option_ids.map(id => <div
                    style={{ flexGrow: 1, flexShrink: 1, flexBasis: "30%", maxWidth: "100%" }}
                >
                    <SelectedOption
                        editing={editable}
                        option={options_by_id[id]}
                        on_remove_option={removed_id =>
                        {
                            props.on_change(selected_option_ids.filter(id => id !== removed_id))
                        }}
                        on_mouse_over_option={props.on_mouse_over_option}
                        on_mouse_leave_option={props.on_mouse_leave_option}
                        on_pointer_down_selected_option={(e, id) =>
                        {
                            props.change_route({ item_id: id })
                        }}
                    />
                </div>)}
            </div>
        </Box>
    )
}

const ConnectedMultiAutocompleteText = connector(_MultiAutocompleteText) as FunctionalComponent<OwnProps>



export function MultiAutocompleteText <E extends AutocompleteOption> (props: OwnProps<E>)
{
    return <ConnectedMultiAutocompleteText {...props} />
}
