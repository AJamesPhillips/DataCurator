import { h } from "preact"
import { useState, useEffect } from "preact/hooks"
import { createClient, PostgrestError, User } from "@supabase/supabase-js"
import { v4 as uuid_v4} from "uuid"


// import { get_new_knowledge_view_object } from "../knowledge_view/create_new_knowledge_view"
// import { get_contextless_new_wcomponent_object } from "../shared/wcomponent/get_new_wcomponent_object"
// import type { KnowledgeView } from "../shared/wcomponent/interfaces/knowledge_view"
// import type { WComponent } from "../shared/wcomponent/interfaces/SpecialisedObjects"

import "./SandBox.css"
import { get_new_knowledge_view_object } from "../knowledge_view/create_new_knowledge_view"
import { get_contextless_new_wcomponent_object } from "../shared/wcomponent/get_new_wcomponent_object"
import type { KnowledgeView } from "../shared/wcomponent/interfaces/knowledge_view"
import type { WComponent } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { sentence_case } from "../shared/utils/sentence_case"
import { sort_list } from "../shared/utils/sort"



let is_supabase_recovery_email = document.location.hash.includes("type=recovery")

const supabase_url = "https://sfkgqscbwofiphfxhnxg.supabase.co"
const SUPABASE_ANONYMOUS_CLIENT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjA2MTkwNSwiZXhwIjoxOTQ3NjM3OTA1fQ.or3FBQDa4CtAA8w7XQtYl_3NTmtFFYPWoafolOpPKgA"
const supabase = createClient(supabase_url, SUPABASE_ANONYMOUS_CLIENT_KEY, { autoRefreshToken: true })
const supabase_auth_state_change: { subscribers: (() => void)[] } = { subscribers: [] }
supabase.auth.onAuthStateChange(() =>
{
    // console .log("Calling ", supabase_auth_state_change.subscribers.length, " subcribers whilst user is ", supabase.auth.user())
    supabase_auth_state_change.subscribers.forEach(subscriber => subscriber())
})


;(window as any).supabase = supabase



export function SandBoxSupabase ()
{
    const [user, set_user] = useState(supabase.auth.user())
    const [email, set_email] = useState("")
    const [password, set_password] = useState("")
    const [supabase_session_error, set_supabase_session_error] = useState<Error | null>(null)

    const [waiting_password_reset_email, set_waiting_password_reset_email] = useState(false)
    const [updating_password, set_updating_password] = useState(is_supabase_recovery_email)
    const [username, set_username] = useState("")

    const [postgrest_error, set_postgrest_error] = useState<PostgrestError | null>(null)
    const [current_base, set_current_base] = useState<SupabaseKnowledgeBase | undefined>(undefined)
    const [bases, set_bases] = useState<SupabaseKnowledgeBaseWithAccess[] | undefined>(undefined)

    const [p_users_by_id, set_p_users_by_id] = useState<PUsersById>({})

    const [access_controls, _set_access_controls] = useState<SupabaseAccessControl[] | undefined>(undefined)
    const set_access_controls = (acs: SupabaseAccessControl[] | undefined) =>
    {
        _set_access_controls(acs && sort_list(acs, ac => ac.inserted_at.getTime(), "ascending"))
    }

    const [knowledge_views, set_knowledge_views] = useState<KnowledgeView[] | undefined>(undefined)
    const knowledge_view = knowledge_views && knowledge_views[0]


    useEffect(() => {
        const subscriber = async () =>
        {
            const new_user = supabase.auth.user()
            // console .log("sub called, ", user, " and now user is ", new_user)
            set_user(new_user)
            set_email(new_user?.email || email)

            // Will need to do something smarter... we do not want to get all the users
            // everytime someone loads the app!  :{}
            const { data, error } = await supabase.from<SupabasePUser>("users").select("*")
            set_postgrest_error(error)
            const map: PUsersById = {}
            ;(data || []).forEach(pu => map[pu.id] = pu)
            set_p_users_by_id(map)
            set_username(map[new_user?.id || ""]?.name || "")
        }

        // Always call subscriber once on start as it is not always called.
        // Perhaps session restore, links from supabase for password reset and magic link sign, are dealth with
        // synchronously or at least very quickly and before this view fires.
        subscriber()

        supabase_auth_state_change.subscribers.push(subscriber)

        const unsubscribe = () =>
        {
            const { subscribers } = supabase_auth_state_change
            supabase_auth_state_change.subscribers = subscribers.filter(sub => sub !== subscriber)
        }

        return unsubscribe
    }, [])



    async function register ()
    {
        const { user: new_user, error } = await supabase.auth.signUp({ email, password })

        set_supabase_session_error(error)
        set_user(new_user)
    }


    async function sign_in ()
    {
        const { user, error } = await supabase.auth.signIn({ email, password })

        set_supabase_session_error(error)
        set_user(user)
    }


    async function forgot_password ()
    {
        const { data, error } = await supabase.auth.api.resetPasswordForEmail(email)

        set_supabase_session_error(error)
        set_waiting_password_reset_email(!error)
    }


    async function update_password ()
    {
        // There should always be an email and password given on password update
        const email = user?.email
        const result = await supabase.auth.update({ email, password, /* data: {} */ })

        set_supabase_session_error(result.error)
        set_user(result.user)
        set_updating_password(!!result.error)
        is_supabase_recovery_email = false
    }


    async function log_out ()
    {
        const { error } = await supabase.auth.signOut()
        set_supabase_session_error(error)
        set_user(supabase.auth.user())
        set_password("")
    }


    async function update_username (username: string)
    {
        const id = user?.id || ""
        const { data, error } = await supabase.from<SupabasePUser>("users").upsert({ id, name: username }).eq("id", id)

        set_postgrest_error(error)
        set_username((data && data[0]?.name) || "" )
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
            <input type="button" disabled={!(user?.email) || !password} onClick={update_password} value="Update password" /><br/>
            {!is_supabase_recovery_email && <input type="button" onClick={() => set_updating_password(false)} value="Cancel" />}<br />
        </div>}

        {!updating_password && <div>
            <input type="button" disabled={!email || !password} onClick={sign_in} value="Signin" />
            <input type="button" disabled={!email || !password} onClick={register} value="Register" /><br/>
            <input type="button" disabled={!email} onClick={forgot_password} value="Forgot password?" /><br/>
        </div>}

        <DisplaySupabaseSessionError error={supabase_session_error} />
    </div>



    return <div>
        Logged in with {user.email} {user.id}<br />
        <input type="button" onClick={log_out} value="Log out" /><br />
        <input type="button" onClick={() => set_updating_password(true)} value="Change password" /><br />

        Your user name:
        <input type="text" placeholder="username" value={username}
            onKeyUp={e => set_username(e.currentTarget.value)}
            onChange={e => set_username(e.currentTarget.value)}
            onBlur={e => set_username(e.currentTarget.value)}
        /><br/>
        <input type="button" onClick={() => update_username(username)} value="Change user name" /><br />

        <DisplaySupabaseSessionError error={supabase_session_error} />
        <br />
        <br />

        <input type="button" onClick={() => get_or_create_a_writing_base({ user, set_postgrest_error, set_current_base })} value="Get a base (optionally create)" />
        <input type="button" onClick={() => get_all_bases({ user, set_postgrest_error, set_bases })} value="Get all bases" />

        <br />
        <br />
        <DisplaySupabasePostgrestError error={postgrest_error} />

        <h3>Bases</h3>
        <br />
        {!bases && current_base && <div>
            <b>Current base</b><br />
            {current_base.public_read ? "Public" : "Private"} &nbsp;
            title: {current_base.title} &nbsp;
            owned by: {get_user_name_for_display({ p_users_by_id, user, other_user_id: current_base.owner_user_id })}
            id: {current_base.id} &nbsp;
        </div>}
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
                    {base.id === current_base?.id ? "Current" : "Other"} &nbsp;
                    {base.public_read ? "Public" : "Private"} &nbsp;
                    title: {base.title} &nbsp;
                    owned by: {get_user_name_for_display({ p_users_by_id, user, other_user_id: base.owner_user_id })} &nbsp;
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
                    modify_base({ base: modified_base, set_postgrest_error, set_current_base })
                }} value="Modify base (change title)" />
            <br />

            <input type="button" onClick={() =>
                {
                    const modified_base = { ...current_base, title: "Current" }
                    modify_base({ base: modified_base, set_postgrest_error, set_current_base })
                }} value="Modify base (reset title)" />
            <br />

            <input type="button" onClick={() =>
                {
                    const modified_base = { ...current_base, owner_user_id: user_1_id }
                    modify_base({ base: modified_base, set_postgrest_error, set_current_base })
                }} value="Modify base (change owner to user_1 -- should FAIL if different user)" />
            <br />

            <input type="button" onClick={() =>
                {
                    const modified_base = { ...current_base, public_read: !current_base.public_read }
                    modify_base({ base: modified_base, set_postgrest_error, set_current_base })
                }} value="Modify base (toggle public read)" />
            <br />
        </div>}


        {current_base && <div>
            <hr />
            <br />
            <h3>Base sharing</h3>
            <br />
            {current_base.public_read ? "Is PUBLIC" : "Is private (not public)"}
            <br />
            <br />

            <input type="button" onClick={() => get_access_controls({ set_postgrest_error, set_access_controls })} value="Open sharing options" /><br />

            {access_controls && <div>
                {access_controls.length} access controls

                {access_controls.map(ac => <div>
                    <AccessControlEntry
                        access_control={ac} base={current_base} p_users_by_id={p_users_by_id} user={user}
                        set_postgrest_error={set_postgrest_error} set_access_controls={set_access_controls} />
                </div>)}

                <br />
                Id or email address of user's account:
                <AddAccessControlEntry base_id={current_base.id} set_access_controls={set_access_controls} />
            </div>}
        </div>}


        {current_base && <div>
            <hr />
            <br />
            <h3>Knowledge Views</h3>
            <br />

            <input type="button" onClick={() => create_knowledge_views({ user, base: current_base, set_postgrest_error, set_knowledge_views })} value="Create knowledge view" />
            <input type="button" onClick={() => get_knowledge_views({ user, set_postgrest_error, set_knowledge_views })} value="Get knowledge views" />
        </div>}


        {knowledge_views && <div>
            {knowledge_views.length} knowledge views

            {knowledge_views.map(kv => <div>
                id: {kv.id} &nbsp;
                title: {kv.title} &nbsp;
                description: {kv.description} &nbsp;
                wc_id_map: {JSON.stringify(Object.keys(kv.wc_id_map || {}))} &nbsp;
                json: {JSON.stringify(kv)} &nbsp;
            </div>)}
        </div>}


        {knowledge_view && <div>

            <input type="button" onClick={() => modify_knowledge_view({ user, knowledge_view, set_postgrest_error, set_knowledge_views })} value="Modify a knowledge view" />
        </div>}


        {/* {base && <div>
            <hr />
            <br />
            <br />

            <input type="button" onClick={() => create_knowledge_views({ user, base, set_postgrest_error, set_knowledge_views })} value="Create knowledge view" />
            <input type="button" onClick={() => get_knowledge_views({ user, set_postgrest_error, set_knowledge_views })} value="Get knowledge views" />
        </div>} */}

    </div>
}



function DisplaySupabaseSessionError (props: { error: Error | null })
{
    const { error } = props
    if (error === null) return null


    const already_registered = error?.message.includes("Thanks for registering") && (error as any)?.status === 400
    if (already_registered) return <div>Please check your email</div>
    // Perhaps need to handle `supabase_session_error?.message === 'JWT expired'` but hopefully `autoRefreshToken` will work


    return <div>Error : {error.message || error}</div>
}



function DisplaySupabasePostgrestError (props: { error: PostgrestError | null })
{
    const { error } = props
    if (error === null) return null

    return <div>
        Error: {error.message || error}
    </div>
}



interface SupabaseKnowledgeBase
{
    id: number
    inserted_at: Date
    updated_at: Date
    owner_user_id: string
    public_read: boolean
    title: string
}
interface DBSupabaseKnowledgeBaseWithAccess extends SupabaseKnowledgeBase
{
    access_controls?: { access_level: ACCESS_CONTROL_LEVEL }[]
}
interface SupabaseKnowledgeBaseWithAccess extends SupabaseKnowledgeBase
{
    access_level?: ACCESS_CONTROL_LEVEL
}



async function get_a_writing_base (user: User)
{
    const { data: knowledge_bases, error } = await supabase
    .from<SupabaseKnowledgeBase>("bases")
    .select("*")
    .eq("owner_user_id", user.id)
    .order("inserted_at", { ascending: true })

    const base = knowledge_bases && knowledge_bases[0] || undefined

    return { base, error }
}



async function get_a_writing_base_optionally_create (user: User)
{
    const first_get_result = await get_a_writing_base(user)
    if (first_get_result.error) return first_get_result
    if (first_get_result.base) return first_get_result

    const res = await supabase.from<SupabaseKnowledgeBase>("bases").insert({ owner_user_id: user.id, title: "Primary" })
    const base = res.data && res.data[0] || undefined
    if (res.error) return { base, error: res.error }

    // Do not return upserted entry as (due to an incredibly unlikely race condition) this
    // might not be the earliest one. Instead refetch to get earliest Knowledge base
    return await get_a_writing_base(user)
}



interface GetOrCreateBaseArgs
{
    user: User
    set_postgrest_error: (error: PostgrestError | null) => void
    set_current_base: (base: SupabaseKnowledgeBase | undefined) => void
}
async function get_or_create_a_writing_base (args: GetOrCreateBaseArgs)
{
    const { base, error: postgrest_error } = await get_a_writing_base_optionally_create(args.user)
    args.set_postgrest_error(postgrest_error)
    args.set_current_base(base)
}



interface GetAllBasesArgs
{
    user: User
    set_postgrest_error: (error: PostgrestError | null) => void
    set_bases: (bases: SupabaseKnowledgeBaseWithAccess[] | undefined) => void
}
async function get_all_bases (args: GetAllBasesArgs)
{
    const res = await supabase.from<DBSupabaseKnowledgeBaseWithAccess>("bases")
        .select("*, access_controls(access_level)")
        .order("inserted_at", { ascending: true })

    args.set_postgrest_error(res.error)

    const data: SupabaseKnowledgeBaseWithAccess[] | null = res.data && res.data.map(r =>
    {
        const access_control = r.access_controls && r.access_controls[0]
        const access_level = access_control && access_control.access_level
        delete r.access_controls

        return { ...r, access_level }
    })
    args.set_bases(data || undefined)
}



interface ModifyBaseArgs
{
    base: SupabaseKnowledgeBase
    set_postgrest_error: (a: PostgrestError | null) => void
    set_current_base: (a: SupabaseKnowledgeBase | undefined) => void
}
async function modify_base (args: ModifyBaseArgs)
{
    const res = await supabase.from<SupabaseKnowledgeBase>("bases").update(args.base).eq("id", args.base.id)
    args.set_postgrest_error(res.error)
    args.set_current_base(res.data ? res.data[0] : undefined)
}



// "Public" users
interface SupabasePUser
{
    id: string
    name: string
}
type PUsersById = { [id: string]: SupabasePUser }


interface GetUserNameForDisplayArgs
{
    p_users_by_id: PUsersById
    user: User
    other_user_id: string
}
function get_user_name_for_display (args: GetUserNameForDisplayArgs)
{
    const { p_users_by_id, user, other_user_id } = args

    let name = p_users_by_id[other_user_id]?.name || ""
    if (!user) name = name || "Someone"
    else name = user.id === other_user_id ? (name ? name + " (You)" : "You") : (name || "(Someone else)")

    return <span title={other_user_id}>{name}</span>
}



type ACCESS_CONTROL_LEVEL = "editor" | "viewer" | "none"
interface SupabaseAccessControlWrite
{
    base_id: number
    user_id: string
    access_level: ACCESS_CONTROL_LEVEL
}
interface SupabaseAccessControl extends SupabaseAccessControlWrite
{
    inserted_at: Date
    updated_at: Date
}



interface GetAcessControlsArgs
{
    set_postgrest_error: (a: PostgrestError | null) => void
    set_access_controls: (a: SupabaseAccessControl[] | undefined) => void
}
async function get_access_controls (args: GetAcessControlsArgs)
{
    const { data, error } = await supabase.from<SupabaseAccessControl>("access_controls").select("*")
    args.set_postgrest_error(error)
    const parsed_data = data && data.map(ac => ({
        ...ac,
        inserted_at: new Date(ac.inserted_at),
        updated_at: new Date(ac.updated_at),
    })) || undefined
    args.set_access_controls(parsed_data)
}



interface UpdateAcessControlArgs
{
    base: SupabaseKnowledgeBase
    other_user_id: string
    grant: ACCESS_CONTROL_LEVEL
    set_postgrest_error: (a: PostgrestError | null) => void
    set_access_controls: (a: SupabaseAccessControl[] | undefined) => void
}
async function update_access_control (args: UpdateAcessControlArgs)
{
    const access_control: SupabaseAccessControlWrite = {
        base_id: args.base.id,
        user_id: args.other_user_id,
        access_level: args.grant,
    }
    const res = await supabase.from<SupabaseAccessControl>("access_controls").upsert(access_control)


    args.set_postgrest_error(res.error)
    if (!res.error) await get_access_controls(args)
}




interface AccessControlEntryProps
{
    access_control: SupabaseAccessControl
    base: SupabaseKnowledgeBaseWithAccess
    p_users_by_id: PUsersById
    user: User
    set_postgrest_error: (a: PostgrestError | null) => void
    set_access_controls: (a: SupabaseAccessControl[] | undefined) => void
}
function AccessControlEntry (props: AccessControlEntryProps)
{
    const { access_control, base, p_users_by_id, user, set_postgrest_error, set_access_controls } = props
    const { user_id: other_user_id, access_level: current_level } = access_control

    const update = (grant: ACCESS_CONTROL_LEVEL) => update_access_control({
        base, other_user_id, grant, set_postgrest_error, set_access_controls,
    })

    return <div>
        user: {get_user_name_for_display({ p_users_by_id, user, other_user_id })} level: {current_level}

        <SelectAccessLevel level="editor" current_level={current_level} on_click={update} />
        <SelectAccessLevel level="viewer" current_level={current_level} on_click={update} />
        <SelectAccessLevel level="none" current_level={current_level} on_click={update} />
        <br />
    </div>
}


interface SelectAccessLevelProps
{
    level: ACCESS_CONTROL_LEVEL
    current_level: ACCESS_CONTROL_LEVEL
    on_click: (level: ACCESS_CONTROL_LEVEL) => void
}
function SelectAccessLevel (props: SelectAccessLevelProps)
{
    const { level, current_level, on_click } = props

    return <input
        type="button"
        onClick={() => on_click(level)}
        value={sentence_case(level)}
        disabled={level === current_level}
    />
}




interface AddAccessControlEntryProps
{
    base_id: number
    set_access_controls: (a: SupabaseAccessControl[] | undefined) => void
}
function AddAccessControlEntry (props: AddAccessControlEntryProps)
{
    const [email_or_uid, set_email_or_uid] = useState("")
    const [access_level, set_access_level] = useState<ACCESS_CONTROL_LEVEL>("editor")
    const [adding_status, set_adding_status] = useState<"initial" | "adding" | "added">("initial")
    const adding = adding_status === "adding"
    const added = adding_status === "added"
    const [postgrest_error, set_postgrest_error] = useState<PostgrestError | null>(null)

    const { base_id, set_access_controls } = props


    return <div>
        <input
            type="text"
            placeholder="User's ID or email"
            value={email_or_uid}
            disabled={adding}
            onKeyUp={e => set_email_or_uid(e.currentTarget.value)}
            onChange={e => set_email_or_uid(e.currentTarget.value)}
            onBlur={e => set_email_or_uid(e.currentTarget.value)}
        />
        <br/>
        <SelectAccessLevel level="editor" current_level={access_level} on_click={set_access_level} />
        <SelectAccessLevel level="viewer" current_level={access_level} on_click={set_access_level} />
        <SelectAccessLevel level="none" current_level={access_level} on_click={set_access_level} />

        <br />
        {adding && <span>Adding...</span>}
        {added && <span>Added.</span>}
        <DisplaySupabasePostgrestError error={postgrest_error} />
        <br />

        <input
            type="button"
            onClick={async () =>
            {
                set_adding_status("adding")

                // TODO next
                const result = await supabase.rpc("invite_user_to_base", { base_id, email_or_uid, access_level })
                const { status, error } = result
                const data: number = result.data as any

                let custom_error: PostgrestError | null = error
                if (data === 403) custom_error = { message: "Invalid base", details: "", hint: "", code: "403" }
                else if (data === 404) custom_error = { message: "Invited user not found", details: "", hint: "", code: "404" }
                // TODO return the status code as well as 409 is easier to work with and
                // more meaningful than the code of "23505" which was given the last time I checked on 2021-09-22
                set_postgrest_error(custom_error)

                await get_access_controls({ set_access_controls, set_postgrest_error })

                if (!custom_error)
                {
                    set_adding_status("added")
                    set_email_or_uid("") // reset form
                }
            }}
            value="Add user"
            disabled={!email_or_uid}
        />
    </div>
}





interface SupabaseKnowledgeView
{
    id: string
    modified_at: Date
    base_id: number
    title: string
    json: KnowledgeView
}



function kv_app_to_supabase (kv: KnowledgeView, base_id?: number): SupabaseKnowledgeView
{
    base_id = kv.base_id || base_id

    if (!base_id) throw new Error("Must provide base_id for kv_app_to_supabase")

    return {
        id: kv.id,
        modified_at: kv.modified_at!,
        base_id,
        title: kv.title,
        json: kv,
    }
}

function kv_supabase_to_app (kv: SupabaseKnowledgeView): KnowledgeView
{
    let { json, id, base_id, modified_at } = kv
    // Ensure all the fields that are edited in the db are set correctly in the json data.
    // Do not update title.  This should only be edited by the client app
    json = { ...json, id, base_id, modified_at }

    json.created_at = json.created_at && new Date(json.created_at)
    json.custom_created_at = json.custom_created_at && new Date(json.custom_created_at)
    json.deleted_at = json.deleted_at && new Date(json.deleted_at)

    return json
}



interface CreateKnowledgeViewArgs
{
    user: User
    base: SupabaseKnowledgeBase
    set_postgrest_error: (error: PostgrestError | null) => void
    set_knowledge_views: (kvs: KnowledgeView[]) => void
}
async function create_knowledge_views (args: CreateKnowledgeViewArgs)
{
    const { data, error } = await supabase
        .from<SupabaseKnowledgeView>("knowledge_views")
        .insert(kv_app_to_supabase(kv1, args.base.id))

    args.set_postgrest_error(error)

    const knowledge_views: KnowledgeView[] = (data || []).map(kv_supabase_to_app)
    args.set_knowledge_views(knowledge_views)
}



interface GetKnowledgeViewsArgs
{
    user: User
    set_postgrest_error: (error: PostgrestError | null) => void
    set_knowledge_views: (kvs: KnowledgeView[]) => void
}
async function get_knowledge_views (args: GetKnowledgeViewsArgs)
{
    const { data, error } = await supabase
    .from<SupabaseKnowledgeView>("knowledge_views")
    .select("*")
    .order("id", { ascending: true })

    args.set_postgrest_error(error)

    const knowledge_views: KnowledgeView[] = (data || []).map(kv_supabase_to_app)
    args.set_knowledge_views(knowledge_views)
}



interface ModifyKnowledgeViewArgs
{
    user: User
    knowledge_view: KnowledgeView
    set_postgrest_error: (error: PostgrestError | null) => void
    set_knowledge_views: (kvs: KnowledgeView[]) => void
}
async function modify_knowledge_view (args: ModifyKnowledgeViewArgs)
{
    const modified_kv: KnowledgeView = { ...args.knowledge_view, title: "Some new title " + Math.random() }
    const db_kv = kv_app_to_supabase(modified_kv)

    const { data, error } = await supabase
    .from<SupabaseKnowledgeView>("knowledge_views")
    .update(db_kv)
    .eq("id", db_kv.id)

    args.set_postgrest_error(error)
    await get_knowledge_views(args)
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
    //     perceptions: [],
    // })
    // const items = await load_solid_data(state)
    // console .log("got items", items)



const wc1 = get_contextless_new_wcomponent_object({ title: "wc1" })
const wcomponents: WComponent[] = [wc1]

const kv1 = get_new_knowledge_view_object({
    id: uuid_v4(),
    title: "kv1",
    wc_id_map: {
        [wc1.id]: { left: 0, top: 0 },
    },
})
const knowledge_views: KnowledgeView[] = [kv1]
