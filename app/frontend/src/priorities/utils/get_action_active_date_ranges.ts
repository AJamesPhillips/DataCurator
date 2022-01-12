import { get_uncertain_datetime } from "../../shared/uncertainty/datetime"
import { get_inclusive_date_strs } from "../../shared/utils/date_helpers"
import { SortDirection } from "../../shared/utils/sort"
import { sort_by_uncertain_event_datetimes } from "../../shared/utils_datetime/partition_by_uncertain_datetime"
import type { WComponentNodeAction } from "../../wcomponent/interfaces/action"
import { VAPsType } from "../../wcomponent/interfaces/VAPsType"
import { ACTION_VALUE_POSSIBILITY_ID } from "../../wcomponent/value/parse_value"
import { group_versions_by_id } from "../../wcomponent_derived/value_and_prediction/group_versions_by_id"
import { get_most_probable_VAPs } from "../../wcomponent_derived/value_and_prediction/probable_VAPs"



const VALID_ACTION_VALUE_POSSIBILITY_ID = new Set<string>(Object.values(ACTION_VALUE_POSSIBILITY_ID))
export function get_action_active_date_ranges (action: WComponentNodeAction)
{
    let VAP_sets = action.values_and_prediction_sets || []
    VAP_sets = group_versions_by_id(VAP_sets).latest
    VAP_sets = sort_by_uncertain_event_datetimes(VAP_sets, SortDirection.ascending)

    let active_start: Date | undefined
    let active_stop: Date | undefined
    const transitions: { start: Date, stop: Date }[] = []

    VAP_sets.forEach(VAP_set =>
    {
        const { entries, datetime } = VAP_set

        const most_probables = get_most_probable_VAPs(entries, VAPsType.action)
        const most_probables_valid = most_probables
            .filter(entry => entry.probability > 0 && entry.value_id && VALID_ACTION_VALUE_POSSIBILITY_ID.has(entry.value_id))
        const most_probable_valid = most_probables_valid[0]

        if (most_probables_valid.length !== 1 || !most_probable_valid)
        {
            console.log(`Skipping calculating action_active_date_ranges for VAP_set "${VAP_set.id}" of action "${action.id}"`)
            return
        }


        const changed_to_active = most_probable_valid.value_id === ACTION_VALUE_POSSIBILITY_ID.action_in_progress
        if (changed_to_active)
        {
            if (active_start) "" // no-op, todo: log error?
            else active_start = get_uncertain_datetime(datetime)
        }
        else
        {
            if (!active_start) "" // no-op, todo: log error if not "potential"?
            else active_stop = get_uncertain_datetime(datetime)
        }


        if (active_start && active_stop)
        {
            transitions.push({ start: active_start, stop: active_stop })
            active_start = undefined
            active_stop = undefined
        }
    })


    if (active_start)
    {
        let stop = new Date()
        if (stop.getTime() < active_start.getTime()) stop = active_start
        transitions.push({ start: active_start, stop })
    }

    return transitions
}



export function get_action_active_date_strs (action: WComponentNodeAction)
{
    const active_date_ranges = get_action_active_date_ranges(action)
    let active_date_strs: string[] = []
    let active_date_strs_set = new Set<string>()

    active_date_ranges.forEach(active_date_range =>
    {
        const dates_covered = get_inclusive_date_strs(active_date_range.start, active_date_range.stop)
        const unique_dates_covered = dates_covered.filter(date_str => !active_date_strs_set.has(date_str))
        active_date_strs = active_date_strs.concat(unique_dates_covered)
        active_date_strs_set = new Set(active_date_strs)
    })

    return active_date_strs
}
