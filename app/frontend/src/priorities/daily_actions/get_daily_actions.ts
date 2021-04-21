import { get_attribute_by_index_lookup, get_attributes_by_index_lookup } from "../../objects/object_content"
import { date2str } from "../../shared/utils/date_helpers"
import type { CoreObjectIdAttribute, CoreObjectValueAttribute, ObjectWithCache, RootState } from "../../state/State"
import { MSECONDS_PER_DAY } from "../../canvas/display"
import type { DailyActionsMeta } from "../interfaces"
import { memoize } from "../../utils/memoize"
import { factory_filter_objects_by_pattern_id_c } from "../../state/objects/filter_objects"


const PATTERN_ACTION_V2 = "p9"

const filter_objects_c = factory_filter_objects_by_pattern_id_c(PATTERN_ACTION_V2)
export function get_daily_actions_meta_c (state: RootState): DailyActionsMeta {

    const raw_actions = filter_objects_c(state.objects)

    return _get_daily_actions_meta_c(raw_actions)
}

const _get_daily_actions_meta_c = memoize(_get_daily_actions_meta, { cache_limit: 1 })
function _get_daily_actions_meta (raw_actions: ObjectWithCache[])
{
    const actions_by_project_id: DailyActionsMeta = {}

    raw_actions.forEach(action => {
        const { attributes, id: action_id } = action

        let project_id_attrs = get_attributes_by_index_lookup(1, attributes) as CoreObjectIdAttribute[]
        const start_datetime_attr = get_attribute_by_index_lookup(8, attributes) as CoreObjectValueAttribute
        const stop_datetime_attr = get_attribute_by_index_lookup(9, attributes) as CoreObjectValueAttribute

        const start_datetime = new Date(start_datetime_attr.value)
        const stop_datetime = new Date(stop_datetime_attr.value)

        if (Number.isNaN(start_datetime.getTime())) return

        project_id_attrs = project_id_attrs.filter(id => !!id)

        project_id_attrs.forEach(({ id }) =>
        {
            actions_by_project_id[id] = actions_by_project_id[id] || {}
        })

        const date_strs: string[] = []
        const start_date_str = date2str(start_datetime, "yyyy-MM-dd")
        date_strs.push(start_date_str)

        const stop_ms = stop_datetime.getTime()
        if (!Number.isNaN(stop_ms))
        {
            let date_time = start_datetime.getTime() + MSECONDS_PER_DAY
            while (date_time < stop_ms)
            {
                const date_str = date2str(new Date(date_time), "yyyy-MM-dd")
                date_strs.push(date_str)

                date_time += MSECONDS_PER_DAY
            }
        }

        project_id_attrs.forEach(({ id: project_id }) =>
        {
            date_strs.forEach(date_str =>
            {
                actions_by_project_id[project_id][date_str] = actions_by_project_id[project_id][date_str] || { action_ids: [] }
                actions_by_project_id[project_id][date_str].action_ids.push(action_id)
            })
        })

    })

    return actions_by_project_id
}
