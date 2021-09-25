import { pub_sub_factory } from "../pub_sub/pub_sub_factory"



interface UserMsgMap
{
    changed_user: true
    stale_users_by_id: true
    stale_bases: true
    changed_bases: true
    changed_chosen_base_id: true
}

export const user_pub_sub = pub_sub_factory<UserMsgMap>()
