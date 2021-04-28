import {
    WComponent,
    wcomponent_has_validity_predictions,
    wcomponent_has_vaps,
} from "../../shared/models/interfaces/SpecialisedObjects"
import type { TimeSliderData, TimeSliderEvent, TimeSliderEventType } from "../interfaces"



export function factory_get_wcomponent_time_slider_data ()
{
    const created_events: TimeSliderEvent[] = []
    const sim_events: TimeSliderEvent[] = []

    const now = new Date()
    create_event(now, "now")


    function create_event (datetime: Date | undefined, type: TimeSliderEventType)
    {
        if (!datetime) return
        if (type !== "sim") created_events.push({ datetime, type })
        if (type !== "created") sim_events.push({ datetime, type })
    }


    return {
        update: (wc: WComponent): void =>
        {
            const { created_at, custom_created_at } = wc

            create_event(custom_created_at || created_at, "created")

            if (wcomponent_has_validity_predictions(wc))
            {
                wc.validity.forEach(({ created_at, custom_created_at }) =>
                {
                    create_event(custom_created_at || created_at, "created")
                })
            }

            if (wcomponent_has_vaps(wc))
            {
                wc.values_and_prediction_sets.forEach(({ created_at, custom_created_at, datetime }) =>
                {
                    create_event(custom_created_at || created_at, "created")
                    create_event(datetime.min, "sim")
                    create_event(datetime.value, "sim")
                    create_event(datetime.max, "sim")
                })
            }

        },
        results: (): TimeSliderData => ({ created_events, sim_events })
    }
}
