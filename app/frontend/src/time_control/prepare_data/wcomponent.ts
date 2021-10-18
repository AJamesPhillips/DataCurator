import {
    WComponent,
    wcomponent_has_event_at,
    wcomponent_has_existence_predictions,
    wcomponent_has_validity_predictions,
    wcomponent_has_VAP_sets,
} from "../../wcomponent/interfaces/SpecialisedObjects"
import type { TemporalUncertainty } from "../../shared/uncertainty/interfaces"
import type { TimeSliderData, TimeSliderEvent, TimeSliderEventType } from "../interfaces"



export function get_wcomponent_time_slider_data (wcomponents: WComponent[]): TimeSliderData
{
    const created_events: TimeSliderEvent[] = []
    const created_events_ms = new Set<number>()
    const sim_events: TimeSliderEvent[] = []
    const sim_events_ms = new Set<number>()


    let min_ms = Number.POSITIVE_INFINITY
    let max_ms = Number.NEGATIVE_INFINITY


    function create_event (datetime: Date | undefined, type: TimeSliderEventType)
    {
        if (!datetime) return

        const ms = datetime.getTime()

        if (type !== "sim" && !created_events_ms.has(ms))
        {
            created_events.push({ datetime, type })
        }

        if (type !== "created" && !sim_events_ms.has(ms))
        {
            sim_events.push({ datetime, type })
        }

        min_ms = Math.min(min_ms, datetime.getTime())
        max_ms = Math.max(max_ms, datetime.getTime())
    }


    function create_events_for_temporal_uncertainty (datetime: TemporalUncertainty)
    {
        create_event(datetime.min, "sim")
        create_event(datetime.value, "sim")
        create_event(datetime.max, "sim")
    }


    wcomponents.forEach(wcomponent =>
    {
        create_event(wcomponent.custom_created_at || wcomponent.created_at, "created")

        if (wcomponent_has_validity_predictions(wcomponent))
        {
            wcomponent.validity.forEach(({ created_at, custom_created_at, datetime }) =>
            {
                create_event(custom_created_at || created_at, "created")
                create_events_for_temporal_uncertainty(datetime)
            })
        }


        if (wcomponent_has_existence_predictions(wcomponent))
        {
            wcomponent.existence.forEach(({ created_at, custom_created_at, datetime }) =>
            {
                create_event(custom_created_at || created_at, "created")
                create_events_for_temporal_uncertainty(datetime)
            })
        }


        if (wcomponent_has_VAP_sets(wcomponent))
        {
            wcomponent.values_and_prediction_sets.forEach(({ created_at, custom_created_at, datetime }) =>
            {
                create_event(custom_created_at || created_at, "created")
                create_events_for_temporal_uncertainty(datetime)
            })
        }


        // FEATURE_TODO::EVENT_AT_CREATED_AT -- display the created_at of event_at entry(s)
        if (wcomponent_has_event_at(wcomponent))
        {
            wcomponent.event_at.forEach(({ /*created_at, custom_created_at,*/ datetime }) =>
            {
                // create_event(custom_created_at || created_at, "created")
                create_events_for_temporal_uncertainty(datetime)
            })
        }
    })


    const now = new Date()
    if (created_events.length === 0) create_event(now, "created")


    // Make sure both lists of events share same min max values
    const locked_min_ms = min_ms
    const locked_max_ms = max_ms
    ;(["created", "sim"] as TimeSliderEventType[]).forEach(type => {
        create_event(new Date(locked_min_ms), type)
        create_event(new Date(locked_max_ms), type)
        create_event(new Date(locked_min_ms - 86400000), type)
        create_event(new Date(locked_max_ms + 86400000), type)
    });


    created_events.sort(sort_by_datetime)
    sim_events.sort(sort_by_datetime)


    return ({ created_events, sim_events })
}



function sort_by_datetime ({ datetime: dt1 }: TimeSliderEvent, { datetime: dt2 }: TimeSliderEvent)
{
    return dt1.getTime() < dt2.getTime() ? -1 : 1
}
