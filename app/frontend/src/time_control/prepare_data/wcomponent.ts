import {
    WComponent,
    wcomponent_has_validity_predictions,
    wcomponent_has_VAPs,
} from "../../shared/models/interfaces/SpecialisedObjects"
import type { TimeSliderData, TimeSliderEvent, TimeSliderEventType } from "../interfaces"



export function get_wcomponent_time_slider_data (wcomponents: WComponent[]): TimeSliderData
{
    const created_events: TimeSliderEvent[] = []
    const created_events_ms = new Set<number>()
    const sim_events: TimeSliderEvent[] = []
    const sim_events_ms = new Set<number>()


    const now = new Date()
    let min_ms = now.getTime()
    let max_ms = now.getTime()
    create_event(now, "now")


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


    wcomponents.forEach(wcomponent =>
    {
        const { created_at, custom_created_at } = wcomponent

        create_event(custom_created_at || created_at, "created")

        if (wcomponent_has_validity_predictions(wcomponent))
        {
            wcomponent.validity.forEach(({ created_at, custom_created_at }) =>
            {
                create_event(custom_created_at || created_at, "created")
            })
        }

        if (wcomponent_has_VAPs(wcomponent))
        {
            wcomponent.values_and_prediction_sets.forEach(({ created_at, custom_created_at, datetime }) =>
            {
                create_event(custom_created_at || created_at, "created")
                create_event(datetime.min, "sim")
                create_event(datetime.value, "sim")
                create_event(datetime.max, "sim")
            })
        }
    })


    ;(["created", "sim"] as TimeSliderEventType[]).forEach(type => {
        create_event(new Date(min_ms), type)
        create_event(new Date(max_ms), type)
        create_event(new Date(min_ms - 86400000), type)
        create_event(new Date(max_ms + 86400000), type)
    });


    created_events.sort(sort_by_datetime)
    sim_events.sort(sort_by_datetime)


    return ({ created_events, sim_events })
}



function sort_by_datetime ({ datetime: dt1 }: TimeSliderEvent, { datetime: dt2 }: TimeSliderEvent)
{
    return dt1.getTime() < dt2.getTime() ? -1 : 1
}
