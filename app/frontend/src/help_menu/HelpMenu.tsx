import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material"
import { h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { Modal } from "../modal/Modal"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import "./HelpMenu.scss"
import { ShortcutCommand } from "./ShortcutCommand"
import { shortcuts_list } from "./shortcuts"



const map_state = (state: RootState) =>
{
    return { show: state.display_options.show_help_menu }
}

const map_dispatch = {
    set_show_help_menu: ACTIONS.display.set_show_help_menu,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _HelpMenu (props: Props)
{
    const [expanded, set_expanded] = useState<string | false>("kbd-shortcuts")

    const handle_change = (panel: string) => (event: any, new_expanded: boolean) => {
        set_expanded(new_expanded ? panel : false)
    }
    if (!props.show) return null

    return <Modal
        size="medium"
        title=""
        on_close={() => props.set_show_help_menu({ show: false })}
        child={(
            <Box p={10}>
                <Typography component="h1" variant="h5">Tips for using DataCurator</Typography>
                <Accordion
                    expanded={expanded === "kbd-shortcuts"}
                    onChange={handle_change("kbd-shortcuts")}
                    // expandIcon={<ExpandMoreIcon />}
                >
                    <AccordionSummary>
                        <Typography component="h2" variant="h6">Commands / shortcuts</Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Box>
                            These shortcuts only work when you are not editing a text field.  Some may only work when you are on the Map (Knowledge) canvas view.
                            {shortcuts_list.map(args => <ShortcutCommand {...args} />)}
                        </Box>
                    </AccordionDetails>
                </Accordion>

                <Accordion
                    expanded={expanded === "linking-tips"}
                    onChange={handle_change("linking-tips")}
                >
                    <AccordionSummary>
                        <Typography component="h2" variant="h6"> Tips on Linking</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box>
                            {tips_on_linking.map(tip => <Typography component="p" paragraph>{tip}</Typography>)}
                        </Box>
                    </AccordionDetails>
                </Accordion>

                <Accordion
                    expanded={expanded === "general-tips"}
                    onChange={handle_change("general-tips")}
                    // expandIcon={<ExpandMoreIcon />}
                >
                    <AccordionSummary>
                        <Typography component="h2" variant="h6">General tips</Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Box>
                            {general_tips.map(tip => <Typography component="p" paragraph>{tip}</Typography>)}
                        </Box>
                    </AccordionDetails>
                </Accordion>

                <Accordion
                    expanded={expanded === "detailed-tips"}
                    onChange={handle_change("detailed-tips")}
                    // expandIcon={<ExpandMoreIcon />}
                >
                    <AccordionSummary>
                        <Typography component="h2" variant="h6">Detailed tips</Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Box>
                            {detailed_tips.map(tip => <Typography component="p" paragraph>{tip}</Typography>)}
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </Box>
        )}
    />
}
export const HelpMenu = connector(_HelpMenu)



const tips_on_linking: (string | h.JSX.Element)[] = [
    `Type "@@" in any text field to access a menu to link to any other component.
    This will insert the id of that component, e.g.  @@12345678-abcd-4123-abcd-1234567890ab.`
    ,
    `Follow "@@some-id" with .url, .title and .description to get the attributes
    of that component e.g. "@@12345678-abcd-4123-abcd-1234567890ab.title".  Or if it has an
    associated knowledge view then add .map to go to that knowledge view.`
    ,
    <span>
        Markdown is available so you can use things like <b>**some text**</b>
        to make it bold once it is rendered during presentation mode.
        Other Markdown syntax like "1. some text" will give you numbered lists.
        See the full <a href="https: //www.markdownguide.org/basic-syntax/">Markdown guide here</a>
    </span>
    ,
]



const general_tips: (string | h.JSX.Element)[] = [
    <div>
        <Typography component="h3" variant="h6">"Action" node type versus "State"</Typography>

        The action components specify each action someone can perform when playing in a simulation built on this model.  e.g. building a new road, or changing a tax rate.
    </div>
]



const detailed_tips: (string | h.JSX.Element)[] = [
    <div>
        <Typography component="h3" variant="h6">State subtypes</Typography>

        There are three State subtypes:

        <ol>
            <li>
                boolean, e.g. True / False
            </li>
            <li>
                number
            </li>
            <li>
                other
            </li>
        </ol>

        Often you can represent the same attribute in different ways and this will depend on what level of detail is salient to the conversation / the model of the scenario you are interested in.

        <ol>
            <li>
                a boolean, with title "The medical response was fast" or "The medical response time was adequate"
            </li>
            <li>
                "other" with title "The medical response", with values of "Very slow", "Slow", "Medium", "Fast", "Very fast" etc.
            </li>
            <li>
                "number" with title "The medical response speed", where the value perhaps represents the time in minutes until aid was first administered.
            </li>
        </ol>

    </div>
    ,
    <div>
        <Typography component="h3" variant="h6">Multidimensional states</Typography>

        Often there can be attributes / concepts which have two dimensions to them which are salient together, e.g. "The medical response was fast and effective".  These can be modelled using states with titles and subtypes in many ways, for example:

        <ol>
            <li>
                a boolean, with title "The medical response was (adequately) fast and effective"
            </li>
            <li>
                "number" with title "The medical response speed and effectiveness", where the value is derived from some formula to calculate a single number based of the two attributes of speed and effectiveness.
            </li>
        </ol>

        If the concept later needs to be analysed / comprehended / explored in greater detail it can be decomposed.  Either it could be change to a subtype of "other" with title "The medical response speed and effectiveness", with values of "fast and effective", "fast but ineffective", "slow but effective", "slow and ineffective".  Or replaced by two new seperate states, one for "Medical response speed" and one for "Medical response effectiveness".  In the latter case deleting the first node from the knowledge views would be best.  In the former case, <a href="https: //github.com/centerofci/data-curator2/issues/36">versioning the whole component</a> would make this easier from a user's perspective.
    </div>
]
