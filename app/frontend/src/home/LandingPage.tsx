import { h } from "preact"
import ChevronRightIcon from "@material-ui/icons/ChevronRight"

import "./LandingPage.scss"
import { Box, Button, Container, makeStyles, ThemeProvider, Typography } from "@material-ui/core"
import { DefaultTheme } from "../ui_themes/material_default"



export function LandingPage() {
    const classes = use_styles();
    return (
        <ThemeProvider theme={DefaultTheme}>
            <Container maxWidth="md" className={classes.root}>
                <Box component="header" className={classes.header}>
                    <Typography component="span" variant="h3" className={classes.icon}>
                        {/* <img className={classes.img} src="https://images.theconversation.com/files/223729/original/file-20180619-126566-1jxjod2.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=1200.0&fit=crop" /> */}
                    </Typography>
                    <Typography component="h1" variant="h3" className={ classes.title }>

                        Data Curator
                        <Typography component="sup" className={ classes.version }> Alpha </Typography>
                    </Typography>
                </Box>
                <Box component="main">
                    <h2>Welcome!</h2>
                    <Box className={`${classes.animated_icon_container} animated_icon_container`}>
                        <Button component="span" variant="text" size="small" endIcon={<ChevronRightIcon className={classes.animated_icon} />}>
                            Click here!
                        </Button>
                        <Button
                            component="a"
                            href="/app/"
                            variant="contained"
                            color="secondary"
                            disableElevation
                            size="large"
                        >
                            <strong>Get Started</strong>
                        </Button>
                    </Box>

                    <h3>What is <strong>Data Curator</strong>?</h3>
                    <p>
                        DataCurator enables you to map and understand complex systems before helping you plan, communicate and navigate successful interventions in them.
                    </p>
                    <p>
                        DataCurator allows you to build, and share your mental models of the world. It aims to facilitate and encourage more precise and systematic recording of all the key elements of these world models: the definitions, state, processes, assumptions, and imagined potential outcomes into the future, based on the past and present.
                    </p>
                    <p>
                        This is a <a href="https://centerofci.org/projects/datacurator/">CCI project</a> supported by our generous funders.
                    </p>

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
                </Box>
                <Box component="footer">
                </Box>
            </Container>
        </ThemeProvider>
    )
}

const use_styles = makeStyles(theme => ({
    root: {
        marginTop: 25,
    },
    version: {
        color: "#a00",
        fontWeight:"bold"
    },
    header: {
        display: "flex", alignItems:"center",
    },
    icon: {

        display:"inline-block",
        minWidth:"1em", maxWidth:"10vw",
        height:"1em",
        overflow: "hidden",
        marginRight: "0.25em",
        "&:empty": {
            display: "none"
        }
    },
    img : {
        display:"block",
        maxHeight:"100%",
    },
    title: {
        fontWeight: "bold",
        flexGrow: 1, flexShrink:1,
        minHeight:"100%"
    },
    animated_icon_container: {
        flexGrow:1,
        display: "flex", justifyContent:"flex-end"
    },
    animated_icon: {
        animationName: "bounce_pointer",
        animationDuration: "0.7777777s",
        animationIterationCount: "2.5",
        animationTtimingFunction: "ease-in-out",
    }
}))
