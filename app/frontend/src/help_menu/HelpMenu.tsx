import { Accordion, AccordionDetails, AccordionSummary, Box, makeStyles, Typography } from "@material-ui/core"
import { h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { Modal } from "../modal/Modal"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useState } from "react"

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
    const [expanded, setExpanded] = useState<string | false>('kbd-shortcuts');
    // React.ChangeEvent<{}>
    const handleChange = (panel: string) => (event:any, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
      };
    if (!props.show) return null

    return <Modal
        size="large"
        title="Help Menu"
        on_close={() => props.set_show_help_menu({ show: false })}
        child={(
            <Box>
                <Typography component="h1" variant="h5">Commands to help you use DataCurator</Typography>
                <Accordion
                    expanded={expanded === 'kbd-shortcuts'}
                    onChange={handleChange('kbd-shortcuts')}
                    expandIcon={<ExpandMoreIcon />}
                >
                    <AccordionSummary>
                        <Typography component="h2" variant="h6"> When on canvas and not in a form element:</Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Box>
                            {commands.map(args => <Command {...args} />)}
                        </Box>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    expanded={expanded === 'linking-tips'}
                    onChange={handleChange('linking-tips')}
                >
                    <AccordionSummary>
                        <Typography  component="h2" variant="h6"> Tips on Linking</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box>
                            <Typography component="p" paragraph>
                                Type "@@" in any text field to access a menu to link to any other component.
                                This will insert the id of that component, e.g. @@wc123.
                            </Typography>
                            <Typography component="p" paragraph>
                                Follow "@@some-id" with .url, .title and .description to get the attributes
                                of that component e.g. "@@wc123.title"
                            </Typography>
                            <Typography component="p" paragraph>
                                Markdown is available so you can use things like <b>**some text**</b>
                                to make it bold once it is rendered during presentation mode.
                                Other Markdown syntax like "1. some text" will give you numbered lists.
                                See the full <a href="https://www.markdownguide.org/basic-syntax/">Markdown guide here</a>
                            </Typography>
                            <Typography component="p" paragraph>
                                Type "@@" in any text field to access a menu to link to any other component.  This will insert the id of that component, e.g. @@wc123.
                            </Typography>
                        </Box>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    expanded={expanded === 'general-tips'}
                    onChange={handleChange('general-tips')}
                    expandIcon={<ExpandMoreIcon />}
                >
                    <AccordionSummary>
                        <Typography component="h2" variant="h6">General tips:</Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Box>
                            <Typography component="p" paragraph>
                                If you yourself writing states with should, e.g. "People should listen more and be less reductionist" then you might consider seperating this out into it's 4 seperate parts and phrasing as the positive or desired state.  Specifically:
                            </Typography>
                            <Typography component="ol">
                                <Typography component="li">the attribute, e.g.: "People listen more and are less reductionist"</Typography>
                                <Typography component="li">the current value, e.g.: "False"</Typography>
                                <Typography component="li">the other possibilities, e.g.: whilst adding a value and if it's not boolean i.e. not True/False and is instead a type of number or other, then add the other different possible values.</Typography>
                                <Typography component="li">the judgement or objective about the desired value, e.g.: create a judgement or objective node, target your state node, and choose the desired value via the comparator</Typography>

                            </Typography>
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </Box>
        )}
    />
}
export const HelpMenu = connector(_HelpMenu)

const commands: CommandArgs[] = [
    { commands: ["Ctrl", "e"], outcome: "Toggle between presenation and editing modes" },
    { commands: ["Ctrl", "d"], outcome: `Toggle "focused" mode on and off` },
    { commands: ["Shift"], outcome: "shows all nodes" },
    { commands: ["Shift", "click", "drag"], outcome: "select multiple nodes" },
    { commands: ["Ctrl", "click", "drag"], outcome: "deselect multiple nodes" },
    { commands: ["Ctrl", "a"], outcome: "select all nodes on knowledge view" },
]

interface CommandArgs
{
    commands: string[]
    outcome: string
}

function Command (props: CommandArgs)
{
    const useStyles = makeStyles(theme => ({
        command: {
            display:"inline"
        },
        outcome: {
            display:"inline"
        }

      }));
    const classes = useStyles();
    return <Box component="dl">
        <Typography component="dt" className={classes.command}>
            {props.commands.map((command, index:number) => {
                return (
                    <Typography component="kbd" variant="body1">
                        {command}
                        {(index < (props.commands.length - 1)) &&  <Typography component="span"> + </Typography>}
                    </Typography>
                )
            })}
        </Typography>
        <Typography component="dd"  className={classes.command}> -&gt; {props.outcome} </Typography>
    </Box>
}
