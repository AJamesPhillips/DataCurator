import { pub_sub_factory } from "../pub_sub/pub_sub_factory"



interface UserMsgMap
{
    changed_user: true
    stale_users_by_id: boolean // true -> full_reload_required of users_by_id
    stale_bases: boolean // true -> full_reload_required of bases
    changed_bases: true
    changed_chosen_base_id: true
}

export const user_pub_sub = pub_sub_factory<UserMsgMap>()
