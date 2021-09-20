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



let is_supabase_recovery_email = document.location.hash.includes("type=recovery")

const supabase_url = "https://sfkgqscbwofiphfxhnxg.supabase.co"
const SUPABASE_ANONYMOUS_CLIENT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjA2MTkwNSwiZXhwIjoxOTQ3NjM3OTA1fQ.or3FBQDa4CtAA8w7XQtYl_3NTmtFFYPWoafolOpPKgA"
const supabase = createClient(supabase_url, SUPABASE_ANONYMOUS_CLIENT_KEY)
const supabase_auth_state_change: { subscribers: (() => void)[] } = { subscribers: [] }
supabase.auth.onAuthStateChange(() =>
{
    // console .log("Calling ", supabase_auth_state_change.subscribers.length, " subcribers whilst user is ", supabase.auth.user())
    supabase_auth_state_change.subscribers.forEach(subscriber => subscriber())
})



export function SandBoxSupabase ()
{
    const [user, set_user] = useState(supabase.auth.user())
    // We use user.email here for initial value as links from supabase for password reset and magic link sign
    // sometimes seems to be processed before the useEffect supabase_auth_state_change subscriber can fire
    const [email, set_email] = useState(user?.email || "")
    const [password, set_password] = useState("")
    const [supabase_session_error, set_supabase_session_error] = useState<Error | null>(null)

    const [waiting_password_reset_email, set_waiting_password_reset_email] = useState(false)
    const [updating_password, set_updating_password] = useState(is_supabase_recovery_email)
    const [postgrest_error, set_postgrest_error] = useState<PostgrestError | null>(null)

    const [base, set_base] = useState<SupabaseKnowledgeBase | undefined>(undefined)

    const [access_controls, set_access_controls] = useState<SupabaseAccessControl[] | undefined>(undefined)

    const [knowledge_views, set_knowledge_views] = useState<KnowledgeView[] | undefined>(undefined)
    const knowledge_view = knowledge_views && knowledge_views[0]


    useEffect(() => {
        const subscriber = () =>
        {
            const new_user = supabase.auth.user()
            // console .log("sub called, ", user, " and now user is ", new_user)
            set_user(new_user)
            set_email(new_user?.email || email)
        }
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



    const user_1_id = "d9e6dde1-15e7-4bdf-a6ca-3cc769c131ee"
    const user_2_id = "e21a5c53-3cef-458c-bfaa-68e5d80c70f8"



    if (waiting_password_reset_email) return <div>
        <h3>Password reset</h3>
        <br/>
        {supabase_session_error ? "Error : " + supabase_session_error : "Please check your email."}
    </div>



    if (!user || updating_password) return <div>

        {updating_password ? "Reset password" : "Signin / Register"}<br/>
        <form>
            <input type="email" placeholder="email" value={email} disabled={updating_password} onChange={e => set_email(e.currentTarget.value)}/><br/>
            <input type="password" placeholder="password" value={password} onChange={e => set_password(e.currentTarget.value)}/><br/>
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

        {supabase_session_error && <div>
            Error: {supabase_session_error.message || supabase_session_error}
        </div>}
    </div>



    return <div>
        Logged in with {user.email} {user.id}<br />
        <input type="button" onClick={log_out} value="Log out" /><br />
        <input type="button" onClick={() => set_updating_password(true)} value="Change password" /><br />
        {supabase_session_error && <div>
            Error: {supabase_session_error.message || supabase_session_error}
        </div>}
        <br />
        <br />

        <input type="button" onClick={() => get_or_create_base({ user, set_postgrest_error, set_base })} value="Get base (optionally create)" />

        <br />
        <br />
        {postgrest_error && <div>
            Error: {postgrest_error.message || postgrest_error}
        </div>}

        <h3>Bases</h3>
        <br />
        {base && <div>
            id: {base.id} &nbsp;
            title: {base.title} &nbsp;
            owned by: {base.owner_user_id === user.id ? "You" : "Someone else"}
        </div>}


        {base && <div>
            <hr />
            <br />
            <h3>Base modification</h3>
            <br />

            <input type="button" onClick={() =>
                {
                    const modified_base = { ...base, title: "Title changed" }
                    modify_base({ base: modified_base, set_postgrest_error, set_base })
                }} value="Modify base (change title)" />
            <br />

            <input type="button" onClick={() =>
                {
                    const modified_base = { ...base, title: "Primary" }
                    modify_base({ base: modified_base, set_postgrest_error, set_base })
                }} value="Modify base (reset title)" />
            <br />

            <input type="button" onClick={() =>
                {
                    const modified_base = { ...base, owner_user_id: user_1_id }
                    modify_base({ base: modified_base, set_postgrest_error, set_base })
                }} value="Modify base (change owner to user_1 -- should FAIL if different user)" />
            <br />

            <input type="button" onClick={() =>
                {
                    const modified_base = { ...base, public_read: !base.public_read }
                    modify_base({ base: modified_base, set_postgrest_error, set_base })
                }} value="Modify base (toggle public read)" />
            <br />
        </div>}


        {base && <div>
            <hr />
            <br />
            <h3>Base sharing</h3>
            <br />
            {base.public_read ? "Is PUBLIC" : "Is private (not public)"}
            <br />
            <br />

            <input type="button" onClick={() => get_access_controls({ user, set_postgrest_error, set_access_controls })} value="Get access controls" />

            {access_controls && <div>
                {access_controls.length} access controls
                {access_controls.map(ac => <div>
                    user_id: {ac.user_id} level: {ac.access_level}
                </div>)}
            </div>}

            <input type="button" onClick={() =>
                {
                    // update_access_control({ base, other_user_id: user_2_id, grant: "editor", set_postgrest_error, set_knowledge_views })
                }}
                value="Grant editor access to ajp+2" />
            <br />

            <input type="button" onClick={() =>
                {
                    // update_access_control({ base, other_user_id: user_2_id, grant: "viewer", set_postgrest_error, set_knowledge_views })
                }}
                value="Grant editor access to ajp+2" />
            <br />

            <input type="button" onClick={() =>
                {
                    // update_access_control({ base, other_user_id: user_2_id, grant: "none", set_postgrest_error, set_knowledge_views })
                }}
                value="Grant editor access to ajp+2" />
            <br />
        </div>}


        {base && <div>
            <hr />
            <br />
            <h3>Knowledge Views</h3>
            <br />

            <input type="button" onClick={() => create_knowledge_views({ user, base, set_postgrest_error, set_knowledge_views })} value="Create knowledge view" />
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


        <div onClick={() => get_acl()}>Get ACL</div>
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



async function get_primary_base (user: User)
{
    const { data: knowledge_bases, error } = await supabase
    .from<SupabaseKnowledgeBase>("bases")
    .select("*")
    .order("inserted_at", { ascending: true })

    const base = knowledge_bases && knowledge_bases[0] || undefined

    return { base, error }
}



async function get_primary_base_optionally_create (user: User)
{
    const first_get_result = await get_primary_base(user)
    if (first_get_result.error) return first_get_result
    if (first_get_result.base) return first_get_result

    const res = await supabase.from<SupabaseKnowledgeBase>("bases").insert({ owner_user_id: user.id, title: "Primary" })
    const base = res.data && res.data[0] || undefined
    if (res.error) return { base, error: res.error }

    // Do not return upserted entry as this might not be earlier one.  Refetch to get earliest primary Knowledge base
    return await get_primary_base(user)
}



interface GetOrCreateBaseArgs
{
    user: User
    set_postgrest_error: (error: PostgrestError | null) => void
    set_base: (base: SupabaseKnowledgeBase | undefined) => void
}
async function get_or_create_base (args: GetOrCreateBaseArgs)
{
    const { base, error: postgrest_error } = await get_primary_base_optionally_create(args.user)
    args.set_postgrest_error(postgrest_error)
    args.set_base(base)
}



interface ModifyBaseArgs
{
    base: SupabaseKnowledgeBase
    set_postgrest_error: (a: PostgrestError | null) => void
    set_base: (a: SupabaseKnowledgeBase | undefined) => void
}
async function modify_base (args: ModifyBaseArgs)
{
    const res = await supabase.from<SupabaseKnowledgeBase>("bases").update(args.base).eq("id", args.base.id)
    args.set_postgrest_error(res.error)
    args.set_base(res.data ? res.data[0] : undefined)
}



type access_control_level = "editor" | "viewer"
interface SupabaseAccessControl
{
    base_id: number
    user_id: string
    inserted_at: Date
    updated_at: Date
    access_level: access_control_level
}



interface GetAcessControlsArgs
{
    user: User
    set_postgrest_error: (a: PostgrestError | null) => void
    set_access_controls: (a: SupabaseAccessControl[] | undefined) => void
}
async function get_access_controls(args: GetAcessControlsArgs)
{
    const res = await supabase.from<SupabaseAccessControl>("access_controls").select("*")
    args.set_postgrest_error(res.error)
    args.set_access_controls(res.data || undefined)
}



interface SupabaseKnowledgeView
{
    id: string
    modified_at: Date
    base_id: number
    title: string
    json: KnowledgeView
}
function kv_app_to_supabase (kv: KnowledgeView, base?: SupabaseKnowledgeBase): SupabaseKnowledgeView
{
    const base_id = kv.base_id || (base && base.id)

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
    .insert(kv_app_to_supabase(kv1, args.base))

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



function get_acl ()
{

}
