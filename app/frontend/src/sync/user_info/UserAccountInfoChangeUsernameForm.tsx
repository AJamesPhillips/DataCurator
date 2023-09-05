import { FunctionalComponent, h } from "preact"
import { useEffect, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import { Box, Button, FormControl, FormGroup, TextField } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import type { PostgrestError } from "@supabase/postgrest-js"

import "../common.scss"
import type { RootState } from "../../state/State"
import { get_supabase } from "../../supabase/get_supabase"
import { DisplaySupabasePostgrestError } from "./DisplaySupabaseErrors"
import { selector_need_to_set_user_name } from "../../state/user_info/selector"
import type { SupabaseUser } from "../../supabase/interfaces"
import { pub_sub } from "../../state/pub_sub/pub_sub"
import type { AsyncState } from "../../utils/async_state"



interface OwnProps {
    on_close: () => void
}


const map_state = (state: RootState) =>
{
    const { user, users_by_id } = state.user_info

    return {
        user,
        users_by_id,
        need_to_set_user_name: selector_need_to_set_user_name(state),
    }
}

const map_dispatch = {}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _UserAccountInfoChangeUsernameForm (props: Props)
{
    const { on_close, user, need_to_set_user_name } = props

    const [username, set_username] = useState("")
    const current_user = (props.users_by_id || {})[user?.id || ""]
    const current_username = current_user?.name || ""
    useEffect(() => set_username(current_username), [current_username])

    const [save_state, set_save_state] = useState<AsyncState>("initial")
    const is_saving = save_state === "in_progress"
    const [postgrest_error, set_postgrest_error] = useState<PostgrestError | null>(null)


    if (!user) return null
    const { id: user_id } = user


    async function update_username ()
    {
        const supabase = get_supabase()

        set_save_state("in_progress")

        const { data, error } = await supabase
            .from<SupabaseUser>("users")
            .upsert({ id: user_id, name: username })
            .eq("id", user_id)

        set_postgrest_error(error)
        const actual_set_username = (data && data[0]?.name) ?? undefined
        if (actual_set_username) pub_sub.user.pub("stale_users_by_id", false)
        set_save_state(error ? "error" : "success")
    }

    const classes = use_styles()

    return <FormGroup className="section">
        <Box className={classes.root}>

            <FormControl variant="standard">
                <TextField
                    disabled={is_saving}
                    onChange={(e: h.JSX.TargetedEvent<HTMLInputElement>) =>
                    {
                        set_username(e.currentTarget.value)
                    }}
                    onBlur={(e: h.JSX.TargetedFocusEvent<HTMLInputElement>) =>
                    {
                        set_username(e.currentTarget.value)
                    }}
                    placeholder="Username"
                    size="small"
                    value={username}
                    variant="outlined"
                />
            </FormControl>

            <Box className={classes.update_button_container}>
                <Button
                    className={classes.update_button}
                    disabled={!username || is_saving}
                    onClick={update_username}
                    variant="contained"

                >
                    {need_to_set_user_name ? "Set" : "Change"} username
                </Button>
            </Box>

            <Box>
                {!need_to_set_user_name && <Button
                    variant="contained"
                    onClick={() =>
                    {
                        on_close()
                        set_postgrest_error(null)
                    }}
                >
                    Close
                </Button>}
            </Box>
        </Box>
        {is_saving && "Saving..."}
        {save_state === "success" && "Saved."}

        <DisplaySupabasePostgrestError error={postgrest_error} />
    </FormGroup>
}

const use_styles = makeStyles(theme => ({
    root: {
        display:"flex",
        justifyContent: "flex-start", alignContent: "center",
    },
    username_input: {
        borderTopRightRadius:0,
        borderBottomRightRadius:0,
    },
    update_button_container: {
        flexGrow: 1,
        textAlign: "left",
        marginLeft: 15,
    },
    update_button: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius:0,
    },
}))

export const UserAccountInfoChangeUsernameForm = connector(_UserAccountInfoChangeUsernameForm) as FunctionalComponent<OwnProps>
