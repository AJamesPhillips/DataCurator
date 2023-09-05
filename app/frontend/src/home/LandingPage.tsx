import ChevronRightIcon from "@mui/icons-material/ChevronRight"

import { styled } from "@mui/material/styles"

import "./LandingPage.scss"
import {
    Box,
    Button,
    Container,
    ThemeProvider,
    Theme,
    StyledEngineProvider,
    Typography,
} from "@mui/material"
import { DefaultTheme } from "../ui_themes/material_default"
import { get_supabase } from "../supabase/get_supabase"
import { get_persisted_state_object } from "../state/persistence/persistence_utils"
import type { UserInfoState } from "../state/user_info/state"



const PREFIX = 'LandingPage';

const classes = {
    root: `${PREFIX}-root`,
    version: `${PREFIX}-version`,
    header: `${PREFIX}-header`,
    icon: `${PREFIX}-icon`,
    img: `${PREFIX}-img`,
    title: `${PREFIX}-title`,
    get_started_button_container: `${PREFIX}-get_started_button_container`,
    animated_icon_container: `${PREFIX}-animated_icon_container`,
    click_here_text: `${PREFIX}-click_here_text`,
    animated_icon: `${PREFIX}-animated_icon`
};

const StyledStyledEngineProvider = styled(StyledEngineProvider)((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        marginTop: 25,
    },

    [`& .${classes.version}`]: {
        color: "#a00",
        fontWeight:"bold"
    },

    [`& .${classes.header}`]: {
        display: "flex", alignItems:"center",
    },

    [`& .${classes.icon}`]: {

        display:"inline-block",
        minWidth:"1em", maxWidth:"10vw",
        height:"1em",
        overflow: "hidden",
        marginRight: "0.25em",
        "&:empty": {
            display: "none"
        }
    },

    [`& .${classes.img}`]: {
        display:"block",
        maxHeight:"100%",
    },

    [`& .${classes.title}`]: {
        fontWeight: "bold",
        flexGrow: 1, flexShrink:1,
        minHeight:"100%"
    },

    [`& .${classes.get_started_button_container}`]: {
        display: "flex",
    },

    [`& .${classes.animated_icon_container}`]: {
        flexGrow: 1,
        display: "flex",
        justifyContent: "flex-end",
        margin: "auto 0",
    },

    [`& .${classes.click_here_text}`]: {
        margin: "auto 0",
        cursor: "default",
    },

    [`& .${classes.animated_icon}`]: {
        animationName: "bounce_pointer",
        animationDuration: "0.7777777s",
        animationIterationCount: "2.5",
        animationTtimingFunction: "ease-in-out",
    }
}));



declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}



export function LandingPage()
{
    const supabase = get_supabase()
    const { has_signed_in_at_least_once } = get_persisted_state_object<UserInfoState>("user_info")
    const session = supabase.auth.session()
    const action_text = (session || has_signed_in_at_least_once) ? "Go to app" : "Get Started"

    const classes = use_styles()

    return (
        <StyledStyledEngineProvider injectFirst>
            <ThemeProvider theme={DefaultTheme}>
                <Container maxWidth="md" className={classes.root}>
                    <Box component="header" className={classes.header}>
                        <Typography component="span" variant="h3" className={classes.icon}>
                            {/* <img className={classes.img} src="https://images.theconversation.com/files/223729/original/file-20180619-126566-1jxjod2.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=1200.0&fit=crop" /> */}
                        </Typography>
                        <Typography component="h1" variant="h3" className={ classes.title }>

                            Data Curator
                            <Typography component="sup" className={ classes.version }> Beta </Typography>
                        </Typography>
                    </Box>
                    <Box component="main">
                        <h2>Welcome!</h2>

                        <div className={classes.get_started_button_container}>
                            <div className={classes.animated_icon_container}>
                                <span className={classes.click_here_text}>Click here!</span>
                                <ChevronRightIcon className={classes.animated_icon} />
                            </div>
                            <Button
                                component="a"
                                href="/app/"
                                variant="contained"
                                color="secondary"
                                disableElevation
                                size="large"
                            >
                                <strong>{action_text}</strong>
                            </Button>
                        </div>

                        {/* Copied from https://centerofci.org/projects/datacurator/ */}

                        <h3>
                            What is <strong>Data Curator</strong>?
                        </h3>

                        <p>
                            DataCurator is a tool to map and manage complex problems.
                        </p>

                        <p>
                            Data is messy, and the more types of data you need the messier it gets. DataCurator helps you to understand complex problems by breaking down large, disparate, and overlapping sets of information into modular component parts.
                        </p>

                        <p>
                            Navigating a complex system requires gathering and interpreting a variety of data from a diverse range of sources: quantitative and qualitative data from different kinds of surveys and studies, research and insights from numerous experts in different fields, sets of goals and priorities from different stakeholders.
                        </p>

                        <p>
                            DataCurator allows you to build a usable, shareable model of a complex system to help you organize successful interventions.
                        </p>

                        <h3>
                            How does it work?
                        </h3>

                        <p>
                            DataCurator visualizes connections between different types of data. You can put all your different types of information into one place, then isolate certain components and identify relationships and patterns across the full range of data.
                        </p>

                        <p>
                            There are two dimensions of time built into the tool: one that lets you track your time within the tool itself, allowing you to check what you did when; and one that lets you plan interventions at simulated timescales.
                        </p>

                        <p>
                            DataCurator allows you to plan for the uncertainty built into potential interventions. Uncertainty is inherent to complex systems: numbers may be inaccurate, people may behave differently than expected, circumstances can change rapidly. Planning a successful intervention requires accounting for various potential outcomes. With DataCurator you can enter a potential event in the simulated timescale of your planned intervention, then assign uncertainty to specific values.
                        </p>

                        <p>
                            For example, you might say that if a positive test rate is at or below 3% it's not a problem, but if it gets above that level different scenarios emerge.
                        </p>

                        <p>
                            DataCurator aims to facilitate and encourage more precise and systematic recording of all the key elements we use to create models: the definitions, statuses, processes, assumptions, and imagined potential outcomes, based on all the information you have.
                        </p>

                        <h3>
                            Who is it for?
                        </h3>

                        <p>
                            DataCurator is for anyone trying to understand a complex system and intervene in it, who has a lot of information to understand and interpret.
                        </p>

                        <p>
                            Use it for simple note-taking and organizing, or model and plan an entire intervention. Choose key indicators to simplify the map or use the goal-priority view to keep your goals on track.
                        </p>

                        <h3>
                            How do I get started?
                        </h3>

                        <p>
                            Click on the <a href="/app/">button</a> above or <a href="https://www.youtube.com/playlist?list=PLdbIJ7BPHJ_lHTDvBE8PhpLccPNq4Mu7E">watch the video tutorial series</a>
                        </p>

                        <p>
                            <iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=PLdbIJ7BPHJ_lHTDvBE8PhpLccPNq4Mu7E" title="YouTube video player" frameBorder="0" {...{ allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" }} allowFullScreen></iframe>
                        </p>

                        <h3>
                            Who built it?
                        </h3>

                        <p>
                            DataCurator is a <a href="https://centerofci.org/projects/datacurator/">CCI project</a> supported by <a href="https://centerofci.org/about/">our generous funders</a>.
                        </p>

                        <h3>
                            I have an idea, question or I have found a bug!
                        </h3>

                        <p>
                            Please post any requests for <a href="https://github.com/centerofci/DataCurator/discussions/categories/q-a">support or questions here</a> or email us at webadmin at centerofci dot org . For any bugs please <a href="https://github.com/centerofci/DataCurator/issues">post here</a>.
                        </p>

                        <br />
                        <br />
                        <br />

                        <a href="/app/#wcomponents/&storage_location=16&subview_id=b97c6b8e-b920-4a10-b446-b84588eebd56&view=knowledge&x=8&y=-1909&zoom=12">
                            <img src="/image_1.png" style={{ maxWidth: "100%" }} />
                        </a>
                        <div>
                            Example screenshot of the <a href="/app/#wcomponents/&storage_location=16&subview_id=b97c6b8e-b920-4a10-b446-b84588eebd56&view=knowledge&x=8&y=-1909&zoom=12">Foresight Obesity model in DataCurator</a>
                        </div>

                        <p style={{ textAlign: "center" }}>
                            <a href="https://centerofci.org/about/">
                                <img src="/cci_logo.svg" style={{ width: 120, marginTop: 40 }} />
                            </a>
                        </p>

                        <p>
                            <a href="/privacy-policy">Privacy Policy</a><br/>
                            <a href="/terms-and-conditions">Terms and Conditions</a>
                        </p>
                    </Box>
                    <Box component="footer">
                    </Box>
                </Container>
            </ThemeProvider>
        </StyledStyledEngineProvider>
    );
}

const use_styles = makeStyles((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        marginTop: 25,
    },

    [`& .${classes.version}`]: {
        color: "#a00",
        fontWeight:"bold"
    },

    [`& .${classes.header}`]: {
        display: "flex", alignItems:"center",
    },

    [`& .${classes.icon}`]: {

        display:"inline-block",
        minWidth:"1em", maxWidth:"10vw",
        height:"1em",
        overflow: "hidden",
        marginRight: "0.25em",
        "&:empty": {
            display: "none"
        }
    },

    [`& .${classes.img}`]: {
        display:"block",
        maxHeight:"100%",
    },

    [`& .${classes.title}`]: {
        fontWeight: "bold",
        flexGrow: 1, flexShrink:1,
        minHeight:"100%"
    },

    [`& .${classes.get_started_button_container}`]: {
        display: "flex",
    },

    [`& .${classes.animated_icon_container}`]: {
        flexGrow: 1,
        display: "flex",
        justifyContent: "flex-end",
        margin: "auto 0",
    },

    [`& .${classes.click_here_text}`]: {
        margin: "auto 0",
        cursor: "default",
    },

    [`& .${classes.animated_icon}`]: {
        animationName: "bounce_pointer",
        animationDuration: "0.7777777s",
        animationIterationCount: "2.5",
        animationTtimingFunction: "ease-in-out",
    }
}))
