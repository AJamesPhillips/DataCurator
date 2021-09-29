import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./MultiAutocompleteText.css"
import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { AutocompleteText } from "./AutocompleteText"
import type { AutocompleteOption } from "./interfaces"
import { SelectedOption } from "./SelectedOption"
import { Box } from "@material-ui/core"
import { useMemo } from "preact/hooks"



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
    always_allow_editing?: boolean
}



const map_state = (state: RootState, own_props: OwnProps) => ({
    editable: own_props.always_allow_editing || !state.display_options.consumption_formatting,
})

const map_dispatch = {
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(map_state, map_dispatch)
type Props<E extends AutocompleteOption> = ConnectedProps<typeof connector> & OwnProps<E>


function _MultiAutocompleteText <E extends AutocompleteOption> (props: Props<E>)
{
    const { editable, options, selected_option_ids } = props

    const filtered_options = useMemo(() => options.filter(({ id }) => !selected_option_ids.includes(id))
    , [options, selected_option_ids])

    const option_by_id = useMemo(() =>
    {
        const inner_option_by_id: { [id: string]: E } = {}
        options.forEach(option => inner_option_by_id[option.id] = option)
        return inner_option_by_id
    }, [options])


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
                allow_editing_when_presenting={editable}
            />}

            <Box display="flex" flexDirection="row" flexWrap="wrap" overflow="hidden">
                {selected_option_ids.map(id => <Box p={1} flexGrow={1} flexShrink={1} flexBasis="30%" maxWidth="100%">
                    <SelectedOption
                        editing={editable}
                        option={option_by_id[id]}
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
                </Box>)}
            </Box>
        </Box>
    )
}

const ConnectedMultiAutocompleteText = connector(_MultiAutocompleteText) as FunctionalComponent<OwnProps>



export function MultiAutocompleteText <E extends AutocompleteOption> (props: OwnProps<E>)
{
    return <ConnectedMultiAutocompleteText {...props} />
}
