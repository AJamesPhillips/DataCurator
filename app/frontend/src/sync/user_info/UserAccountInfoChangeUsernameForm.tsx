import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import "../common.scss"
import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { get_supabase } from "../../supabase/get_supabase"
import { DisplaySupabasePostgrestError } from "./DisplaySupabaseErrors"
import { selector_need_to_set_user_name } from "../../state/user_info/selector"
import type { SupabaseUser } from "../../supabase/interfaces"
import type { PostgrestError } from "@supabase/postgrest-js"
import { useEffect } from "preact/hooks"
import { pub_sub } from "../../state/pub_sub/pub_sub"
import type { AsyncState } from "../../utils/async_state"
import { Box, Button, FormControl, FormGroup, makeStyles, TextField } from "@material-ui/core"



interface OwnProps {
    on_close: () => void
}


const map_state = (state: RootState) =>
{
    return {
        user: state.user_info.user,
        user_name: state.user_info.user_name,
        need_to_set_user_name: selector_need_to_set_user_name(state),
    }
}

const map_dispatch = {}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _UserAccountInfoChangeUsernameForm (props: Props)
{
    const { on_close, user, user_name: stored_user_name, need_to_set_user_name } = props

    const [username, set_username] = useState("")
    const [save_state, set_save_state] = useState<AsyncState>("initial")
    const is_saving = save_state === "in_progress"
    const [postgrest_error, set_postgrest_error] = useState<PostgrestError | null>(null)


    useEffect(() => set_username(stored_user_name || ""), [stored_user_name])


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
        if (actual_set_username) pub_sub.user.pub("stale_users_by_id", true)
        set_save_state(error ? "error" : "success")
    }

    const classes = use_styles();

    return <FormGroup className="section">
        <Box className={classes.root}>

            <FormControl>
                <TextField
                    disabled={is_saving}
                    onBlur={async (e:any) => set_username(e.currentTarget.value)}
                    onChange={(e:any) => set_username(e.currentTarget.value)}
                    onKeyUp={(e:any) => set_username(e.currentTarget.value)}
                    placeholder="Username"
                    size="small"
                    value={username}
                    variant="outlined"
                />
            </FormControl>
            {/* <form>
                <input type="text" placeholder="Username" value={username} disabled={is_saving}
                    onKeyUp={e => set_username(e.currentTarget.value)}
                    onChange={e => set_username(e.currentTarget.value)}
                    onBlur={async e => set_username(e.currentTarget.value)}
                /><br/>
            </form> */}


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
