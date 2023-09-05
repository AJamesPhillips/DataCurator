import { h } from "preact"
import { styled } from "@mui/material/styles"
import {
    Avatar,
    Badge,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
} from "@mui/material"
import PersonIcon from "@mui/icons-material/Person"
import PeopleIcon from "@mui/icons-material/People"
import { useState } from "preact/hooks"



const PREFIX = 'ActiveUserWidget';

const classes = {
    badge: `${PREFIX}-badge`,
    button: `${PREFIX}-button`,
    icon: `${PREFIX}-icon`
};

const StyledBox = styled(Box)((
    {
        theme
    }
) => ({
    [`& .${classes.button}`]: {
        display:"inline-block",
        marginRight:"1em",
        border: `1px ${theme.palette.divider} solid`
    },

    [`& .${classes.icon}`]: {
        position:"relative",
        zIndex:10,
    }
}));



export function ActiveUserWidget ()
{
    const active_user_count = 0 + 0
    const classes = use_styles()
    const [user_list_is_open, set_user_list_is_open] = useState(false)

    const handleClickOpen = () => {
        set_user_list_is_open(true)
    }

    const handleClose = (value: string) => {
        set_user_list_is_open(false)
    }

    if (active_user_count <= 0) return null


    return (
        <StyledBox>
            <IconButton
                aria-label={`${active_user_count}  Active users`}
                className={classes.button}
                onClick={handleClickOpen}
                size="small"
            >
                <StyledBadge
                    badgeContent={active_user_count}
                    color="secondary"
                    overlap="rectangle"
                    max={10}
                    classes={{
                        badge: classes.badge
                    }}>
                    {(active_user_count == 1) && <PersonIcon className={classes.icon} />}
                    {(active_user_count > 1) && <PeopleIcon className={classes.icon} />}

                </StyledBadge>
            </IconButton>
            <Dialog open={user_list_is_open} onClose={handleClose} scroll="paper">
                <DialogTitle>Active Users</DialogTitle>
                <DialogContent>
                    <List dense>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <PersonIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="username1" secondary="user1@email.com" />
                        </ListItem>

                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <PersonIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="username2" secondary="user2@email.com" />
                        </ListItem>
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledBox>
    );
}


const StyledBadge = Badge

const use_styles = makeStyles((
    {
        theme
    }
) => ({
    [`& .${classes.button}`]: {
        display:"inline-block",
        marginRight:"1em",
        border: `1px ${theme.palette.divider} solid`
    },

    [`& .${classes.icon}`]: {
        position:"relative",
        zIndex:10,
    }
}))
