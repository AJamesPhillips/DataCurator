import { h } from "preact"
import { Avatar, Badge, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemAvatar, ListItemText, makeStyles, withStyles } from "@material-ui/core"
import PersonIcon from "@material-ui/icons/Person"
import PeopleIcon from "@material-ui/icons/People"
import { useState } from "react"



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
        <Box>
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
                >
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
        </Box>
    )
}


const StyledBadge = withStyles((theme) => ({
    badge: {
        top:2, right:"-0.42em",
        zIndex: 1,
    },
  }))(Badge)

const use_styles = makeStyles(theme => ({
    button: {
        display:"inline-block",
        marginRight:"1em",
        border: `1px ${theme.palette.divider} solid`
    },
    icon: {
        position:"relative",
        zIndex:10,
    }
}))
