import { Box, Button, CssBaseline, Menu, MenuItem } from "@material-ui/core"
import MenuIcon from '@material-ui/icons/Menu';
import { h } from "preact"
import { useState } from "preact/hooks";
import { ALLOWED_ROUTES } from "../state/routing/interfaces"
import { Tab } from "./Tab"
interface TabsContainerProps
{
    content_changed: () => void
}

export function TabsContainer (props: TabsContainerProps)
{
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleClick = (event: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    setTimeout(() => props.content_changed(), 0) // remove hack
    let routes = ALLOWED_ROUTES
    if (localStorage.getItem("hide_other_tabs"))
    {
        routes = routes.filter(r => r === "objects" || r === "views" || r === "wcomponents")
    }

    return (
        <Box mb={5} display="flex" flexDirection="column" alignItems="end">
            <Button onClick={handleClick} aria-controls="select_tab" fullWidth={true} aria-haspopup="true">
                <Box component="span" width={1} display="flex" flexDirection="row" flexWrap="nowrap" justifyContent="space-between" alignItems="start" alignContent="stretch">
                    <Box component="strong">CURRENT_VIEW_NAME</Box>
                    <MenuIcon  />
                </Box>
            </Button>
            <Menu anchorEl={anchorEl} id="select_tab" onClose={handleClose} open={Boolean(anchorEl)} keepMounted>
                {routes.map(route => <MenuItem onClick={handleClose}><Tab id={route} /></MenuItem>)}
            </Menu>
        </Box>
    )
}
