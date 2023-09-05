import { FunctionalComponent, h } from "preact"
import { styled } from "@mui/material/styles"
import { useEffect, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import { Box, Button, Typography } from "@mui/material"
import LogoutIcon from "@mui/icons-material/ExitToApp"
import type { ApiError } from "@supabase/supabase-js"

import "../common.scss"
import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { selector_need_to_set_user_name, selector_user_name } from "../../state/user_info/selector"
import { save_and_optionally_signout } from "../../state/user_info/signout"
import { DisplaySupabaseSessionError } from "./DisplaySupabaseErrors"
import { UserAccountInfoChangePasswordForm } from "./UserAccountInfoChangePasswordForm"
import { UserAccountInfoChangeUsernameForm } from "./UserAccountInfoChangeUsernameForm"



const PREFIX = 'UserAccountInfoForm';

const classes = {
    root: `${PREFIX}-root`,
    section: `${PREFIX}-section`,
    logout_section: `${PREFIX}-logout_section`,
    button: `${PREFIX}-button`,
    label: `${PREFIX}-label`
};

const Root = styled('wnProps')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        margin: 5,
    },

    [`& .${classes.section}`]: {
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
    },

    [`& .${classes.logout_section}`]: {
        flexBasis:"100%",
    },

    [`& .${classes.button}`]: {
        marginBottom: 5,
    },

    [`& .${classes.label}`]: {
        marginBottom:10,
    }
}));



interface OwnProps {
    on_close?: () => void
}


const map_state = (state: RootState) =>
{
    const { need_to_handle_password_recovery } = state.user_info

    return {
        user: state.user_info.user,
        user_name: selector_user_name(state),
        need_to_set_user_name: selector_need_to_set_user_name(state),
        need_to_handle_password_recovery,
    }
}

const map_dispatch = {
    set_user: ACTIONS.user_info.set_user,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps

const use_styles = makeStyles((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        margin: 5,
    },

    [`& .${classes.section}`]: {
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
    },

    [`& .${classes.logout_section}`]: {
        flexBasis:"100%",
    },

    [`& .${classes.button}`]: {
        marginBottom: 5,
    },

    [`& .${classes.label}`]: {
        marginBottom:10,
    }
}))



function _UserAccountInfoForm (props: Props)
{
    const { user, user_name, need_to_set_user_name, need_to_handle_password_recovery, set_user } = props

    const [form_state, set_form_state] = useState<"initial" | "updating_password" | "updating_username">("initial")
    const [supabase_session_error, set_supabase_session_error] = useState<ApiError | null>(null)

    console .log("user account info form need_to_set_user_name", need_to_set_user_name, "form_state", form_state)

    useEffect(() =>
    {
        if (need_to_set_user_name) set_form_state("updating_username")
    }, [need_to_set_user_name, form_state])


    if (!user) return null


    if (form_state === "updating_password" || need_to_handle_password_recovery)
    {
        return <UserAccountInfoChangePasswordForm on_close={() => set_form_state("initial")} />
    }


    if (form_state === "updating_username")
    {
        return <UserAccountInfoChangeUsernameForm on_close={() => set_form_state("initial")} />
    }

    const classes = use_styles()
    return <Box className={classes.root}>
        <Box className={`${classes.section} ${classes.logout_section} section`}>
                <p>
                    Logged in with
                    <strong> {user.email} </strong>
                </p>
                <Box>
                    <Button
                        onClick={() => save_and_optionally_signout(true)}
                        variant="contained"
                        endIcon={<LogoutIcon />}
                    >
                        Log out
                    </Button>
                </Box>
        </Box>

        <Box className={`${classes.section} section`} display="flex" justifyContent="space-between">
            <Typography component="p">
                User name <strong>{user_name ? `: ${user_name}` : ""}</strong><br />
                <small>user id: &nbsp; {user.id}</small>
            </Typography>
            <Box>
                <Button className={classes.button} variant="contained" onClick={() => set_form_state("updating_username")}>
                    {need_to_set_user_name ? "Set" : "Change"} username
                </Button>
                <br />
                <Button variant="contained" onClick={() => set_form_state("updating_password")}>
                     Change password
                </Button>
            </Box>
        </Box>
        <DisplaySupabaseSessionError error={supabase_session_error} />
    </Box>
}

export const UserAccountInfoForm = connector(_UserAccountInfoForm) as FunctionalComponent<OwnProps>
