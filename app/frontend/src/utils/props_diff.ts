

;(window as any).props_sequence = []

export function props_diff (last_props: any)
{
    const { props_sequence } = (window as any as { props_sequence: any[] })
    props_sequence.push(last_props)
    if (props_sequence.length === 1) return console .log("1st props stored")

    const first_props = props_sequence[0]

    const prop_keys = Array.from(new Set(Object.keys(first_props).concat(Object.keys(last_props))))
    prop_keys.sort()

    prop_keys.forEach(prop_key =>
    {
        if (first_props[prop_key] !== last_props[prop_key])
        {
            console.log(`Diff props for "${prop_key}"`, first_props[prop_key], last_props[prop_key])
        }
    })
}
