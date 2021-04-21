import { WComponent, wcomponent_has_validity_predictions } from "../../shared/models/interfaces/SpecialisedObjects"
import type { TimeSliderData } from "../interfaces"



export function factory_get_wcomponent_time_slider_data ()
{
    const events = [{ start_date: new Date() }]

    function create_event (date: Date | undefined)
    {
        if (!date) return
        events.push({ start_date: date })
    }

    return {
        update: (wc: WComponent): void =>
        {
            const { created_at, custom_created_at } = wc

            custom_created_at || create_event(created_at)
            create_event(custom_created_at)

            if (wcomponent_has_validity_predictions(wc))
            {
                wc.validity.forEach(({ created_at, custom_created_at }) =>
                {
                    custom_created_at || create_event(created_at)
                    create_event(custom_created_at)
                })
            }

        },
        results: (): TimeSliderData => ({ events })
    }
}
