import { h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { useState } from "preact/hooks"
import { Accordion, AccordionDetails, AccordionSummary, Box, makeStyles, Typography } from "@material-ui/core"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"

import { Modal } from "../modal/Modal"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"



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
        title="Help Menu"
        on_close={() => props.set_show_help_menu({ show: false })}
        child={(
            <Box p={10}>
                <Typography component="h1" variant="h5">Tips for using DataCurator</Typography>
                <Accordion
                    expanded={expanded === "kbd-shortcuts"}
                    onChange={handle_change("kbd-shortcuts")}
                    expandIcon={<ExpandMoreIcon />}
                >
                    <AccordionSummary>
                        <Typography component="h2" variant="h6">Commands / shortcuts</Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Box>
                            These shortcuts only work when you are not editing a text field.  Some may only work when you are on the Map (Knowledge) canvas view.
                            {keyboard_shortcuts.map(args => <KeyboardShortcutCommand {...args} />)}
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
                    expandIcon={<ExpandMoreIcon />}
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
                    expandIcon={<ExpandMoreIcon />}
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



const keyboard_shortcuts: KeyboardShortcutProps[] = [
    { keyboard_shortcut: ["?"], outcome: "Opens this help menu" },
    { keyboard_shortcut: ["Ctrl", "e"], outcome: "Toggle between presenation and editing modes" },
    { keyboard_shortcut: ["Ctrl", "d", "f"], outcome: `Toggle "focused" mode on and off` },
    { keyboard_shortcut: ["Ctrl", "d", "t"], outcome: `Toggle showing time sliders` },
    { keyboard_shortcut: ["Ctrl", "d", "s"], outcome: `Toggle showing side panel` },
    { keyboard_shortcut: ["Ctrl", "d", "a"], outcome: `Toggle animating connections` },
    { keyboard_shortcut: ["Ctrl", "d", "c"], outcome: `Toggle showing connections as (more) circular` },
    { keyboard_shortcut: ["Shift", "click", "drag"], outcome: "Select multiple nodes" },
    { keyboard_shortcut: ["Shift", "Ctrl", "click", "drag"], outcome: "Deselect multiple nodes" },
    { keyboard_shortcut: ["Ctrl", "s", "f"], outcome: "Expand selection forward along causal connections" },
    { keyboard_shortcut: ["Ctrl", "s", "c"], outcome: "Expand selection along source causal connections" },
    { keyboard_shortcut: ["Ctrl", "a"], outcome: "Select all nodes on knowledge view" },
    { keyboard_shortcut: ["Ctrl", "s", "e"], outcome: "Expand selection along connections and nodes" },
    { keyboard_shortcut: ["Ctrl", "s", "d"], outcome: "Contract selection along single connections and nodes" },
    { keyboard_shortcut: ["Ctrl", "s", "i"], outcome: "Selection components inbetween (interconnections)" },
    { keyboard_shortcut: ["Ctrl", "f"], outcome: "Open the search menu" },
]

interface KeyboardShortcutProps
{
    keyboard_shortcut: string[]
    outcome: string
}

function KeyboardShortcutCommand (props: KeyboardShortcutProps)
{

    const classes = use_styles()


    return <Box component="dl">
        <Typography component="dt" className={classes.command}>
            {props.keyboard_shortcut.map((command, index) => {
                return (
                    <Typography component="kbd" variant="body1">
                        {command}
                        {(index < (props.keyboard_shortcut.length - 1)) && <Typography component="span"> + </Typography>}
                    </Typography>
                )
            })}
        </Typography>
        <Typography component="dd" className={classes.command}> -&gt; {props.outcome} </Typography>
    </Box>
}



const use_styles = makeStyles(theme => ({
    command: {
        display: "inline"
    },
    outcome: {
        display: "inline"
    }
}))



const tips_on_linking: (string | h.JSX.Element)[] = [
    `Type "@@" in any text field to access a menu to link to any other component.
    This will insert the id of that component, e.g.  @@12345678-abcd-4123-abcd-1234567890ab or @@wc123 (short ids).`
    ,
    `Follow "@@some-id" with .url, .title and .description to get the attributes
    of that component e.g. "@@12345678-abcd-4123-abcd-1234567890ab.title"`
    ,
    <span>
        Markdown is available so you can use things like <b>**some text**</b>
        to make it bold once it is rendered during presentation mode.
        Other Markdown syntax like "1. some text" will give you numbered lists.
        See the full <a href="https: //www.markdownguide.org/basic-syntax/">Markdown guide here</a>
    </span>
    ,
    `Type "@@" in any text field to access a menu to link to any other component.  This will insert the id of that component, e.g. @@wc123.`
    ,
]



const general_tips: (string | h.JSX.Element)[] = [
    <div>
        <Typography component="h3" variant="h6">"Should" word usage</Typography>

        If you yourself writing states with "should", e.g. "People <b>should</b> listen more and be less reductionist" then you might consider seperating this out into its 4 seperate parts and phrasing as the positive or desired state.  Specifically:
        <ol>
            <li>
                the attribute, e.g.: "People listen more and be less reductionist".  Note it's usually easier to express this as the desired state instead of the pure attribute of "People's ability to listen and what degree of complexity they can hold in their minds about different subjects".
            </li>
            <li>
                the current value, e.g.: "False"
            </li>
            <li>
                the other possibilities.  If the value is a boolean i.e. True/False then this can be skipped otherwise if it is a number or other type of value then add the other different possible values.
            </li>
            <li>
                the judgement or objective about the desired value, e.g.: create a judgement or objective node, target your state node, and choose the desired value via the comparator
            </li>
        </ol>
    </div>
    ,
    <div>
        <Typography component="h3" variant="h6">"Action" node type versus "State"</Typography>

        The action and state node types are very similar.  The former can be used to draw attention to the areas were you or a team member can have an effect on the project.  You can use actions to represent the activity of third party actors but this usually draws unwarranted attention to these components.
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
    ,
    <div>
        <Typography component="h3" variant="h6">Temporal uncertainty</Typography>

        <p>
            Part of making predictions is knowing when some event may occur.  For this we have a very simple "Temporal Uncertainty" form that has three fields: Min, Expected and Max datetime.
        </p>

        <p>
            It's important to note that this represents a single event and not a distribution of similar events.  It is also not directly the uncertain temporal range a state might exist over.  i.e. the min is the earliest when the event can occur.  This is easier to understand if you talk about the max value.  The max is the latest the event can occur.  This means the state (associate with state transition events) will occur from the max of an event marking its existence but might occur earlier: up to an including the min datetime of the event.
        </p>

        <p>
            A concrete example: you will switch on the light in 1 minute (min), likely in 5 minutes (expected) or at most in 10 minutes (max).  But this does not mean the room will be lit from 1 minutes time to 10 minutes time.
        </p>

        <p>
            The current form is also woefully simplistic for a lot of the uncertain temporal distributions you have inside your head, use almost all the time, use seamlessly, unconsciously, and yet are vital to coordinated effective collaboration, for (complex) interventions.
        </p>

        <p>
            For example: when are you going to get funding for project X, when will have a hire for position Y, when will your change job, when will you next go shopping (if it's not raining AND someone else not gone yet AND time after 7 am AND time less 10 am then ...).
        </p>

    </div>
]
