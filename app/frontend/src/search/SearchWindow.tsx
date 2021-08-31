import Accordion from "@material-ui/core/Accordion"
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary"
import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button";
import yellow from "@material-ui/core/colors/yellow";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RefreshIcon from '@material-ui/icons/Refresh';
import WarningIcon from '@material-ui/icons/Warning';

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
    const [is_accordion_open, set_is_accordion_open] = useState<boolean>(false);
    const warning_icon_basic_search =  <WarningIcon  titleAccess="You might be getting sub optimal search results!" style={{ color: yellow[600] }}  />
    const is_default_search = () => (search_type == 'best' && search_fields == 'all')

    return <Modal
        on_close={() => props.on_blur && props.on_blur()}
        title={props.search_window_title}
        child={<Box p={5}>
            <Accordion onChange={(e, expanded) => {
                set_is_accordion_open(expanded);
            }}>
                <AccordionSummary expandIcon={(!is_default_search() && !is_accordion_open) ? warning_icon_basic_search : <ExpandMoreIcon /> }>
                    <Typography component="h2">
                        {(is_accordion_open) ? "Hide " : "Show " }
                        Advanced Search Options
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box width={1}>
                        <Box display="flex" justifyContent="flex-start" alignItems="stretch">
                            <Box mr={10} flexGrow={1} flexShrink={0}>
                                <FormControl component="fieldset" fullWidth={true}>
                                    <FormLabel component="legend">Search Type: </FormLabel>
                                    <RadioGroup
                                        name="search_type"
                                        value={search_type}
                                        onChange={(e) => set_search_type(e.target.value)}
                                    >
                                        <FormControlLabel value="exact" control={<Radio />} label="Exact" />
                                        <FormControlLabel value="fuzzy" control={<Radio />} label="Fuzzy" />
                                        <FormControlLabel value="best" control={<Radio />} label="Best" />
                                    </RadioGroup>
                                </FormControl>
                            </Box>
                            <Box mr={10} flexGrow={1} flexShrink={0}>
                                <FormControl component="fieldset" fullWidth={true}>
                                    <FormLabel component="legend">Search Over: </FormLabel>
                                    <RadioGroup
                                        name="search_fields"
                                        value={search_fields}
                                        onChange={(e) => set_search_fields(e.target.value)}
                                    >
                                        <FormControlLabel value="all" control={<Radio />} label="All" />
                                        <FormControlLabel value="title" control={<Radio />} label="Title Only" />
                                    </RadioGroup>
                                </FormControl>
                            </Box>
                            <Box flexGrow={1} flexShrink={0} alignSelf="flex-end" textAlign="right">
                                {(!is_default_search()) && <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        set_search_type('best');
                                        set_search_fields('all');
                                    }}
                                    endIcon={<RefreshIcon />}
                                >
                                    Reset Search Options
                                </Button>}
                            </Box>
                        </Box>


                        <Box style={{ opacity: search_type_used ? 0.7 : 0 }}>
                            Used: {search_type_used}
                        </Box>
                    </Box>
                </AccordionDetails>
            </Accordion>

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
                allow_editing_when_presenting={true}
            />
        </Box>}
    />
}
