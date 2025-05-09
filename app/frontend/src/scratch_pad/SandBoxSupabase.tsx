/* eslint-disable @typescript-eslint/no-misused-promises */
import SyncIcon from "@mui/icons-material/Sync"
import type { AuthError, PostgrestError, PostgrestResponse, User as SupabaseAuthUser, User } from "@supabase/supabase-js"
import { useEffect, useState } from "preact/hooks"
import { v4 as uuid_v4 } from "uuid"

import { AccessControlEntry } from "../access_controls/AccessControlEntry"
import { AddAccessControlEntry } from "../access_controls/AddAccessControl"
import { get_new_knowledge_view_object } from "../knowledge_view/create_new_knowledge_view"
import type { KnowledgeView } from "../shared/interfaces/knowledge_view"
import { SortDirection, sort_list } from "../shared/utils/sort"
import {
    knowledge_view_app_to_supabase,
    knowledge_view_supabase_to_app,
    supabase_get_knowledge_views,
} from "../state/sync/supabase/knowledge_view"
import { get_access_controls_for_base } from "../supabase/access_controls"
import { create_a_base, get_all_bases, modify_base } from "../supabase/bases"
import { get_supabase } from "../supabase/get_supabase"
import type {
    SupabaseAccessControl,
    SupabaseKnowledgeBase,
    SupabaseKnowledgeBaseWithAccess,
    SupabaseReadKnowledgeView,
    SupabaseUser,
    SupabaseUsersById,
} from "../supabase/interfaces"
import { get_user_name_for_display } from "../supabase/users"
import {
    DisplaySupabasePostgrestError,
    DisplaySupabaseSessionError,
} from "../sync/user_info/DisplaySupabaseErrors"
import { replace_element } from "../utils/list"
import { prepare_new_contextless_wcomponent_object } from "../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import type { WComponent } from "../wcomponent/interfaces/SpecialisedObjects"
import "./SandBox.scss"



let is_supabase_recovery_email = document.location.hash.includes("type=recovery")


const supabase = get_supabase()
const supabase_auth_state_change: { subscribers: (() => void)[] } = { subscribers: [] }
supabase.auth.onAuthStateChange(() =>
{
    // console .log("Calling ", supabase_auth_state_change.subscribers.length, " subcribers whilst user is ", supabase.auth.user())
    supabase_auth_state_change.subscribers.forEach(subscriber => subscriber())
})


// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
;(window as any).supabase = supabase



export function SandBoxSupabase ()
{
    const [user, set_user] = useState<User | null>(null)
    const [email, set_email] = useState("")
    const [password, set_password] = useState("")
    const [supabase_session_error, set_supabase_session_error] = useState<AuthError | null>(null)

    const [waiting_user_registration_email, set_waiting_user_registration_email] = useState(false)
    const [waiting_password_reset_email, set_waiting_password_reset_email] = useState(false)
    const [updating_password, set_updating_password] = useState(is_supabase_recovery_email)
    const [async_request_in_progress, set_async_request_in_progress] = useState(false)

    const [postgrest_error, set_postgrest_error] = useState<PostgrestError | null>(null)
    const [bases, set_bases] = useState<SupabaseKnowledgeBaseWithAccess[] | undefined>(undefined)
    const [current_base_id, set_current_base_id] = useState<number | undefined>(undefined)
    useEffect(() => {
        if (!bases) return set_current_base_id(undefined)
        if (!current_base_id || !bases.find(({ id }) => id === current_base_id))
        {
            return set_current_base_id(bases.filter(b => b.owner_user_id === user?.id)[0]?.id)
        }
    }, [bases])
    const current_base = bases?.find(({ id }) => id === current_base_id)

    const [users_by_id, set_users_by_id] = useState<SupabaseUsersById>({})

    const [access_controls, _set_access_controls] = useState<SupabaseAccessControl[] | undefined>(undefined)
    const set_access_controls = (acs: SupabaseAccessControl[] | undefined) =>
    {
        _set_access_controls(acs && sort_list(acs, ac => ac.inserted_at.getTime(), SortDirection.ascending))
    }
    useEffect(() =>
    {
        if (current_base_id) get_access_controls({ base_id: current_base_id, set_postgrest_error, set_access_controls })
        else set_access_controls(undefined)
    }, [current_base_id])

    const [knowledge_views, set_knowledge_views] = useState<KnowledgeView[] | undefined>(undefined)
    const knowledge_view = knowledge_views && knowledge_views[0]


    const is_owner = !!user && (user.id === current_base?.owner_user_id)


    useEffect(() => {
        const subscriber = async () =>
        {
            const { data: { user }, error: error_getting_user } = await supabase.auth.getUser()
            // console .log("sub called, ", user, " and now user is ", new_user)
            set_user(user)
            set_email(user?.email || email)

            set_supabase_session_error(error_getting_user)
            if (error_getting_user) return

            // Will need to do something smarter... we do not want to get all the users
            // everytime someone loads the app!  :{}
            const { data, error } = await supabase.from("users").select<"users", SupabaseUser>()
            set_postgrest_error(error)
            const map: SupabaseUsersById = {}
            ;(data || []).forEach(pu => map[pu.id] = pu)
            set_users_by_id(map)
            // set_username(map[new_user?.id || ""]?.name || "")
        }

        // Always call subscriber once on start as it is not always called.
        // Perhaps session restore, links from supabase for password reset and magic link sign, are dealth with
        // synchronously or at least very quickly and before this view fires.
        subscriber()

        supabase_auth_state_change.subscribers.push(() => { subscriber() })

        const unsubscribe = () =>
        {
            const { subscribers } = supabase_auth_state_change
            supabase_auth_state_change.subscribers = subscribers.filter(sub => sub !== subscriber)
        }

        return unsubscribe
    }, [])



    async function register ()
    {
        set_async_request_in_progress(true)
        const { data: { user }, error } = await supabase.auth.signUp({ email, password })
        set_async_request_in_progress(false)

        set_user(user)
        set_supabase_session_error(error)
        set_waiting_user_registration_email(true)
    }


    async function sign_in ()
    {
        set_async_request_in_progress(true)
        const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password })
        set_async_request_in_progress(false)

        set_user(user)
        set_supabase_session_error(error)
    }


    async function forgot_password ()
    {
        set_async_request_in_progress(true)
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        set_async_request_in_progress(false)

        set_supabase_session_error(error)
        set_waiting_password_reset_email(!error)
    }


    async function update_password ()
    {
        // There should always be an email and password given on password update
        const email = user?.email
        set_async_request_in_progress(true)
        const { data, error } = await supabase.auth.updateUser({ email, password, /* data: {} */ })
        set_async_request_in_progress(false)

        set_supabase_session_error(error)
        set_user(data.user)
        set_updating_password(!!error)
        is_supabase_recovery_email = false
    }


    async function log_out ()
    {
        set_async_request_in_progress(true)
        const { error } = await supabase.auth.signOut()
        set_async_request_in_progress(false)

        set_supabase_session_error(error)

        const { data: { user }, error: error_getting_user } = await supabase.auth.getUser()
        set_user(user)
        set_password("")
        set_supabase_session_error(error_getting_user)
    }



    const user_1_id = "d9e6dde1-15e7-4bdf-a6ca-3cc769c131ee"
    const user_2_id = "e21a5c53-3cef-458c-bfaa-68e5d80c70f8"



    if (waiting_password_reset_email) return <div>
        <h3>Password reset</h3>
        <br/>
        {!supabase_session_error && "Please check your email"}
        <DisplaySupabaseSessionError error={supabase_session_error} />
    </div>



    if (!user || updating_password) return <div>

        {updating_password ? "Reset password" : "Signin / Register"}<br/>
        <form>
            <input type="email" placeholder="email" value={email} disabled={updating_password}
                onKeyUp={e => set_email(e.currentTarget.value)}
                onChange={e => set_email(e.currentTarget.value)}
                onBlur={e => set_email(e.currentTarget.value)}
            /><br/>
            <input type="password" placeholder="password" value={password}
                onKeyUp={e => set_password(e.currentTarget.value)}
                onChange={e => set_password(e.currentTarget.value)}
                onBlur={e => set_password(e.currentTarget.value)}
            /><br/>
        </form>

        {updating_password && <div>
            {async_request_in_progress && <SyncIcon className="animate spinning" />}
            <input
                type="button"
                value="Update password"
                disabled={async_request_in_progress || !(user?.email) || !password}
                onClick={update_password}
            /><br/>
            {!is_supabase_recovery_email && <input
                type="button"
                onClick={() => set_updating_password(false)}
                value="Cancel"
            />}<br />
        </div>}

        {!updating_password && <div>
            {async_request_in_progress && <SyncIcon className="animate spinning" />}
            <input
                type="button"
                value="Signin"
                disabled={async_request_in_progress || !email || !password}
                onClick={sign_in}
            />
            <input
                type="button"
                value="Register"
                disabled={async_request_in_progress || !email || !password}
                onClick={register}
            /><br/>
            <input
                type="button"
                value="Forgot password?"
                disabled={async_request_in_progress || !email}
                onClick={forgot_password}
            /><br/>
        </div>}

        <DisplaySupabaseSessionError error={supabase_session_error} />
    </div>


    if (waiting_user_registration_email) return <div>
        <h3>Registered</h3>
        <br/>
        Please check your email
    </div>


    const user_id = user.id

    return <div>
        Logged in with {user.email} {user.id}<br />
        {async_request_in_progress && <SyncIcon className="animate spinning" />}
        <input
            type="button"
            value="Log out"
            disabled={async_request_in_progress}
            onClick={log_out}
        /><br />
        <input type="button" onClick={() => set_updating_password(true)} value="Change password" /><br />

        <Username user={user} users_by_id={users_by_id} set_postgrest_error={set_postgrest_error} /><br />

        <DisplaySupabaseSessionError error={supabase_session_error} />
        <br />
        <br />

        <input type="button" onClick={() => get_all_bases2({ set_postgrest_error, set_bases, user_id })} value="Get all bases" />
        <input type="button" onClick={() => get_or_create_an_owned_base({ user_id, set_postgrest_error, set_current_base_id })} value="Get a base (optionally create)" />

        <br />
        <br />
        <DisplaySupabasePostgrestError error={postgrest_error} />

        <h3>Bases</h3>
        <br />
        {bases && <div>
            {bases.length} bases <br/>

            {bases
            .map(base =>
            {
                const { access_level } = base
                const access_description = access_level === "editor" ? "Editor"
                    : access_level === "viewer" ? "Viewer"
                    : base.public_read ? "Viewer (public access)" : "?"

                return <div style={{ fontWeight: base.id === current_base?.id ? "bold" : undefined }}>
                    <input
                        type="radio"
                        checked={base.id === current_base?.id}
                        onClick={() => set_current_base_id(base.id)}
                    /> &nbsp;
                    {base.public_read ? "Public" : "Private"} &nbsp;
                    title: {base.title} &nbsp;
                    owned by: {get_user_name_for_display({ users_by_id: users_by_id, current_user_id: user_id, other_user_id: base.owner_user_id })} &nbsp;
                    id: {base.id} &nbsp;
                    {base.owner_user_id !== user.id && <span>
                        access: {access_description} &nbsp;
                    </span>}
                </div>
            })}
        </div>}


        {current_base && <div>
            <hr />
            <br />
            <h3>Base modification</h3>
            <br />

            <input type="button" onClick={() =>
                {
                    const modified_base = { ...current_base, title: "Title changed" }
                    modify_base_wrapper({ base: modified_base, set_postgrest_error, set_bases, user_id })
                }} value="Modify base (change title)" />
            <br />

            <input type="button" onClick={() =>
                {
                    const modified_base = { ...current_base, title: "Primary" }
                    modify_base_wrapper({ base: modified_base, set_postgrest_error, set_bases, user_id })
                }} value="Modify base (reset title)" />
            <br />

            <input type="button" onClick={() =>
                {
                    const modified_base = { ...current_base, owner_user_id: user_1_id }
                    modify_base_wrapper({ base: modified_base, set_postgrest_error, set_bases, user_id })
                }} value="Modify base (change owner to user_1 -- should FAIL if different user)" />
            <br />

            <input type="button" onClick={() =>
                {
                    const modified_base = { ...current_base, public_read: !current_base.public_read }
                    modify_base_wrapper({ base: modified_base, set_postgrest_error, set_bases, user_id })
                }} value="Modify base (toggle public read)" />
            <br />
        </div>}


        {current_base && current_base_id && <div>
            <hr />
            <br />
            <h3>Base sharing</h3>
            <br />
            {current_base.public_read ? "Is PUBLIC" : "Is private (not public)"}
            <br />
            <br />

            <input type="button" onClick={() => get_access_controls({ base_id: current_base_id, set_postgrest_error, set_access_controls })} value="Refresh sharing info" /><br />

            {access_controls && <div>
                {access_controls.length} access controls

                {access_controls.map(ac => <div>
                    <AccessControlEntry
                        access_control={ac}
                        base_id={current_base_id} users_by_id={users_by_id} current_user_id={user.id}
                        is_owner={is_owner}
                        on_update={res => on_update_access_control({ base_id: current_base_id, res, set_postgrest_error, set_access_controls })} />
                </div>)}

                <br />
                Id or email address of user's account:
                <AddAccessControlEntry
                    base_id={current_base_id}
                    on_add_or_exit={stale_access_controls =>
                    {
                        if (!stale_access_controls) return

                        get_access_controls({
                            base_id: current_base_id,
                            set_postgrest_error,
                            set_access_controls,
                        })
                    }}
                />
            </div>}
        </div>}


        {current_base_id !== undefined && <div>
            <hr />
            <br />
            <h3>Knowledge Views</h3>
            <br />

            <input
                type="button"
                onClick={async () =>
                {
                    const { error, value: knowledge_views } = await supabase_get_knowledge_views({
                        supabase, base_id: current_base_id
                    })
                    set_postgrest_error(error || null) // change this to undefined at some point
                    set_knowledge_views(knowledge_views)
                }}
                value={`Get knowledge views for base ${current_base_id}`}
            />
            <input
                type="button"
                onClick={async () =>
                {
                    const { error, value: knowledge_views } = await supabase_get_knowledge_views({
                        supabase, all_bases: true
                    })
                    set_postgrest_error(error || null) // change this to undefined at some point
                    set_knowledge_views(knowledge_views)
                }}
                value={`Get all knowledge views`}
            />
            <input
                type="button"
                onClick={() => create_knowledge_views({ base_id: current_base_id, set_postgrest_error, set_knowledge_views })}
                value={`Create knowledge view in base ${current_base_id}`}
            />
        </div>}


        {knowledge_views && <div>
            {knowledge_views.length} knowledge views

            {knowledge_views.map(kv => <div>
                <b>base_id</b>: {kv.base_id} &nbsp;
                <b>id</b>: {kv.id} &nbsp;
                <b>title</b>: {kv.title} &nbsp;
                <b>description</b>: {kv.description} &nbsp;
                <b>wc_id_map ids</b>: {JSON.stringify(Object.keys(kv.wc_id_map))} &nbsp;
                <b>json</b>: {JSON.stringify({ ...kv, base_id: undefined, id: undefined, title: undefined, description: undefined })} &nbsp;
                <hr />
            </div>)}
        </div>}


        {knowledge_views && knowledge_view && <div>

            <input
                type="button"
                onClick={() => modify_knowledge_view({
                    knowledge_view, current_knowledge_views: knowledge_views,
                    set_postgrest_error, set_knowledge_views })}
                value="Modify a knowledge view (set random title) then fetch all for all bases"
            />
        </div>}

    </div>
}



interface UsernameProps
{
    user: SupabaseAuthUser
    users_by_id: SupabaseUsersById
    set_postgrest_error: (error: PostgrestError | null) => void
}
function Username (props: UsernameProps)
{
    const [username, set_username] = useState("")
    const [is_saving, set_is_saving] = useState(false)

    const { user, users_by_id, set_postgrest_error } = props

    const name_in_db = users_by_id[user.id]?.name || ""
    useEffect(() => { if (username !== name_in_db) set_username(name_in_db) }, [name_in_db])


    async function update_username (name: string)
    {
        set_is_saving(true)
        const { id } = user
        const { data, error } = await supabase.from("users")
            .upsert({ id, name })
            .eq("id", id)
            .select<"users", SupabaseUser>()

        set_postgrest_error(error)
        set_username(data && data[0]?.name || "")
        set_is_saving(false)
    }


    return <div>
        {is_saving ? "Saving" : "Your"} user name:
        <input type="text" placeholder="username" value={username}
            disabled={is_saving}
            onKeyUp={e => set_username(e.currentTarget.value)}
            onChange={e => set_username(e.currentTarget.value)}
            onBlur={e =>
            {
                set_username(e.currentTarget.value)
                update_username(e.currentTarget.value)
            }}
        /><br/>
    </div>
}



interface GetOrCreateBaseArgs
{
    user_id: string
    set_postgrest_error: (error: PostgrestError | null) => void
    set_current_base_id: (base_id: number | undefined) => void
}
async function get_or_create_an_owned_base (args: GetOrCreateBaseArgs)
{
    const { base, error: postgrest_error } = await get_an_owned_base_optionally_create(args.user_id)
    args.set_postgrest_error(postgrest_error)
    args.set_current_base_id(base?.id)
}



async function get_an_owned_base_optionally_create (user_id: string)
{
    const first_get_result = await get_an_owned_base(user_id)
    if (first_get_result.error) return first_get_result
    if (first_get_result.base) return first_get_result

    const res = await create_a_base({ owner_user_id: user_id })

    if (res.error) return res

    // Do not return upserted entry as (due to an incredibly unlikely race condition) this
    // might not be the earliest one. Instead refetch to get earliest Knowledge base
    return await get_an_owned_base(user_id)
}



async function get_an_owned_base (user_id: string)
{
    const supabase = get_supabase()
    const { data: knowledge_bases, error } = await supabase
        .from("bases")
        .select<"bases", SupabaseKnowledgeBase>()
        .eq("owner_user_id", user_id)
        .order("inserted_at", { ascending: true })

    const base = knowledge_bases && knowledge_bases[0] || undefined

    return { base, error }
}



interface GetAllBasesArgs
{
    user_id: string
    set_postgrest_error: (error: PostgrestError | null) => void
    set_bases: (bases: SupabaseKnowledgeBaseWithAccess[] | undefined) => void
}
async function get_all_bases2 (args: GetAllBasesArgs)
{
    const res = await get_all_bases(args.user_id)

    args.set_postgrest_error(res.error)
    args.set_bases(res.data)
}



interface ModifyBaseArgs
{
    user_id: string
    base: SupabaseKnowledgeBase
    set_postgrest_error: (a: PostgrestError | null) => void
    set_bases: (a: SupabaseKnowledgeBaseWithAccess[] | undefined) => void
}
async function modify_base_wrapper (args: ModifyBaseArgs)
{
    const { base, set_postgrest_error, set_bases } = args

    const res = await modify_base(base)
    set_postgrest_error(res.error)

    if (!res.error) await get_all_bases2({ set_postgrest_error, set_bases, user_id: args.user_id })
}



interface GetAcessControlsArgs
{
    base_id: number
    set_postgrest_error: (a: PostgrestError | null) => void
    set_access_controls: (a: SupabaseAccessControl[] | undefined) => void
}
async function get_access_controls (args: GetAcessControlsArgs)
{
    const res = await get_access_controls_for_base(args.base_id)

    args.set_postgrest_error(res.error)
    args.set_access_controls(res.access_controls)
}



interface UpdateAcessControlArgs
{
    base_id: number
    res: PostgrestResponse<SupabaseAccessControl>
    set_postgrest_error: (a: PostgrestError | null) => void
    set_access_controls: (a: SupabaseAccessControl[] | undefined) => void
}
async function on_update_access_control (args: UpdateAcessControlArgs)
{
    args.set_postgrest_error(args.res.error)
    if (!args.res.error) await get_access_controls(args)
}



interface CreateKnowledgeViewArgs
{
    base_id: number
    set_postgrest_error: (error: PostgrestError | null) => void
    set_knowledge_views: (kvs: KnowledgeView[]) => void
}
async function create_knowledge_views (args: CreateKnowledgeViewArgs)
{
    const default_data = generate_default_data(args.base_id)
    const a_knowledge_view = default_data.knowledge_views[0]!

    const { data, error } = await supabase
        .from("knowledge_views")
        .insert([knowledge_view_app_to_supabase(a_knowledge_view, args.base_id)])
        .select<"knowledge_views", SupabaseReadKnowledgeView>()

    args.set_postgrest_error(error)
    const knowledge_views: KnowledgeView[] = (data || []).map(knowledge_view_supabase_to_app)
    args.set_knowledge_views(knowledge_views)
}



interface ModifyKnowledgeViewArgs
{
    knowledge_view: KnowledgeView
    current_knowledge_views: KnowledgeView[]
    set_postgrest_error: (error: PostgrestError | null) => void
    set_knowledge_views: (kvs: KnowledgeView[]) => void
}
async function modify_knowledge_view (args: ModifyKnowledgeViewArgs)
{
    const { knowledge_view, current_knowledge_views, set_postgrest_error, set_knowledge_views } = args

    const modified_kv: KnowledgeView = { ...knowledge_view, title: "Some new title " + Math.random() }
    const db_kv = knowledge_view_app_to_supabase(modified_kv)

    const result = await supabase
    .rpc("update_knowledge_view", { item: db_kv })

    // const result = await supabase
    // .from<SupabaseKnowledgeView>("knowledge_views")
    // .update(db_kv)
    // .eq("id", db_kv.id)

    let error: PostgrestError | null = result.error
    if (result.status === 404) error = { message: "Not Found", details: "", hint: "", code: "404", name: "" }

    set_postgrest_error(error)
    if (error) return

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const new_supabase_kv: SupabaseReadKnowledgeView = result.data
    // // type guard
    // if (!new_supabase_kv) return
    const new_kv = knowledge_view_supabase_to_app(new_supabase_kv)

    const updated_knowledge_views = replace_element(current_knowledge_views, new_kv, kv => kv.id === knowledge_view.id)
    set_knowledge_views(updated_knowledge_views)
}


    // const { data: knowledge_views, error } = await supabase
    // .from("knowledge_views")
    // .select("*")


    // .upsert([kv1])

    // const url = urls.pod_directory
    // const state: RootState = {
    //     user_info: {
    //         solid_oidc_provider: urls.broker,
    //         user_name: "abc",
    //         default_solid_pod_URL: url,
    //         custom_solid_pod_URLs: [],
    //         chosen_custom_solid_pod_URL_index: 0,
    //     }
    // } as Partial<RootState> as any

    // await save_solid_data(state.user_info, {
    //     knowledge_views,
    //     wcomponents,
    // })
    // const items = await load_solid_data(state)
    // console .log("got items", items)



function generate_default_data (base_id: number)
{
    const wc1 = prepare_new_contextless_wcomponent_object({ base_id, title: "wc1" })
    const wcomponents: WComponent[] = [wc1]

    const kv1 = get_new_knowledge_view_object({
        id: uuid_v4(),
        base_id,
        title: "kv1",
        wc_id_map: {
            [wc1.id]: { left: 0, top: 0 },
        },
    })
    const knowledge_views: KnowledgeView[] = [kv1]

    return { knowledge_views, wcomponents }
}
